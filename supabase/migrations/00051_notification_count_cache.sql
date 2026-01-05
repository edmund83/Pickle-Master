-- Migration: Add denormalized unread notification count to profiles
-- Purpose: Eliminate expensive count: 'exact' queries on every notification poll
-- This reduces Supabase API load significantly at scale

-- Add unread_notification_count column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS unread_notification_count INTEGER DEFAULT 0;

-- Create function to update unread notification count
CREATE OR REPLACE FUNCTION update_unread_notification_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: new unread notification
  IF TG_OP = 'INSERT' AND NEW.is_read = FALSE THEN
    UPDATE profiles
    SET unread_notification_count = unread_notification_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- Handle UPDATE: notification marked as read
  IF TG_OP = 'UPDATE' AND OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
    UPDATE profiles
    SET unread_notification_count = GREATEST(0, unread_notification_count - 1)
    WHERE id = OLD.user_id;
    RETURN NEW;
  END IF;

  -- Handle UPDATE: notification marked as unread (rare case)
  IF TG_OP = 'UPDATE' AND OLD.is_read = TRUE AND NEW.is_read = FALSE THEN
    UPDATE profiles
    SET unread_notification_count = unread_notification_count + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
  END IF;

  -- Handle DELETE: unread notification deleted
  IF TG_OP = 'DELETE' AND OLD.is_read = FALSE THEN
    UPDATE profiles
    SET unread_notification_count = GREATEST(0, unread_notification_count - 1)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications table
DROP TRIGGER IF EXISTS trigger_notification_count ON notifications;
CREATE TRIGGER trigger_notification_count
  AFTER INSERT OR UPDATE OF is_read OR DELETE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_unread_notification_count();

-- Backfill existing unread counts
UPDATE profiles p
SET unread_notification_count = (
  SELECT COUNT(*)
  FROM notifications n
  WHERE n.user_id = p.id
    AND n.is_read = FALSE
);

-- Create optimized partial index for unread notifications
-- This index only includes unread notifications, making it much smaller and faster
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread_partial
  ON notifications(user_id, created_at DESC)
  WHERE is_read = FALSE;

-- Add comment explaining the denormalization strategy
COMMENT ON COLUMN profiles.unread_notification_count IS
  'Denormalized count of unread notifications. Maintained by trigger on notifications table. Used to avoid expensive count queries on every poll.';
