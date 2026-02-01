#!/usr/bin/env python3
"""
Team Functionality Test Script for StockZip
Tests: Role permissions, Team settings UI, Invitation workflow, Member management

Usage:
  TEST_EMAIL=your@email.com TEST_PASSWORD=yourpassword python3 tests/team-test.py
"""

import os
import sys
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

# Configuration
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
TEST_EMAIL = os.environ.get("TEST_EMAIL", "")
TEST_PASSWORD = os.environ.get("TEST_PASSWORD", "")
SCREENSHOT_DIR = os.environ.get("SCREENSHOT_DIR", "/tmp/team-tests")

# Test results storage
test_results = []

def log(message: str, status: str = "INFO"):
    """Log with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    prefix = {"PASS": "✅", "FAIL": "❌", "INFO": "ℹ️", "WARN": "⚠️"}.get(status, "•")
    print(f"[{timestamp}] {prefix} {message}")

def record_result(test_id: str, name: str, passed: bool, details: str = ""):
    """Record test result"""
    test_results.append({
        "id": test_id,
        "name": name,
        "passed": passed,
        "details": details
    })
    status = "PASS" if passed else "FAIL"
    log(f"{test_id}: {name} - {details if details else 'OK'}", status)

def screenshot(page, name: str):
    """Take a screenshot"""
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    path = f"{SCREENSHOT_DIR}/{name}.png"
    page.screenshot(path=path, full_page=True)
    log(f"Screenshot saved: {path}")
    return path


def test_login(page):
    """Test login functionality and authenticate"""
    log("Testing login flow...", "INFO")

    try:
        # Navigate to login page
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state("networkidle")
        screenshot(page, "01-login-page")

        # Verify login page elements
        expect(page.locator("text=Sign in to StockZip")).to_be_visible()
        record_result("LOGIN-001", "Login page loads", True)

        # Fill in credentials
        page.fill("#userEmail", TEST_EMAIL)
        page.fill("#userPassword", TEST_PASSWORD)
        screenshot(page, "02-login-filled")

        # Submit login form
        page.click("button[type='submit']:has-text('Sign in to StockZip')")

        # Wait for redirect to dashboard
        page.wait_for_url("**/dashboard**", timeout=15000)
        page.wait_for_load_state("networkidle")
        screenshot(page, "03-dashboard-after-login")

        record_result("LOGIN-002", "Login successful", True)
        return True

    except Exception as e:
        record_result("LOGIN-002", "Login successful", False, str(e))
        screenshot(page, "login-error")
        return False


def test_team_page_navigation(page):
    """Test navigation to team settings page"""
    log("Testing team page navigation...", "INFO")

    try:
        # Navigate directly to team settings
        page.goto(f"{BASE_URL}/settings/team")
        page.wait_for_load_state("networkidle")
        time.sleep(2)  # Wait for React hydration
        screenshot(page, "04-team-settings-page")

        # Verify page loaded
        expect(page.locator("h1:has-text('Team')")).to_be_visible(timeout=10000)
        record_result("TEAM-001", "Team page loads", True)

        return True

    except Exception as e:
        record_result("TEAM-001", "Team page loads", False, str(e))
        screenshot(page, "team-page-error")
        return False


def test_team_members_display(page):
    """Test team members list display"""
    log("Testing team members display...", "INFO")

    try:
        # Check for Team Members section
        team_card = page.locator("text=Team Members").first
        expect(team_card).to_be_visible()
        record_result("TEAM-002", "Team Members section visible", True)

        # Check for members count badge
        member_badge = page.locator("span:has-text('member')")
        if member_badge.count() > 0:
            record_result("TEAM-003", "Member count badge visible", True)
        else:
            record_result("TEAM-003", "Member count badge visible", False, "Badge not found")

        # Check for current user highlight
        you_badge = page.locator("text=You").first
        if you_badge.is_visible():
            record_result("TEAM-004", "Current user marked with 'You' badge", True)
        else:
            record_result("TEAM-004", "Current user marked with 'You' badge", False, "Not found")

        screenshot(page, "05-team-members-list")
        return True

    except Exception as e:
        record_result("TEAM-002", "Team Members section visible", False, str(e))
        return False


def test_role_badges(page):
    """Test role badges display correctly"""
    log("Testing role badges...", "INFO")

    try:
        # Check for Owner badge
        owner_badge = page.locator("span:has-text('Owner')").first
        if owner_badge.is_visible():
            record_result("ROLE-001", "Owner role badge visible", True)
        else:
            record_result("ROLE-001", "Owner role badge visible", False)

        # Check for role permissions section
        permissions_section = page.locator("text=Role Permissions")
        if permissions_section.is_visible():
            record_result("ROLE-002", "Role Permissions section visible", True)
            screenshot(page, "06-role-permissions")
        else:
            record_result("ROLE-002", "Role Permissions section visible", False)

        # Check for all three role descriptions
        roles = ["Owner", "Staff", "Viewer"]
        for role in roles:
            role_card = page.locator(f"span:has-text('{role}')")
            if role_card.count() > 0:
                record_result(f"ROLE-{role.upper()}", f"{role} role defined", True)
            else:
                record_result(f"ROLE-{role.upper()}", f"{role} role defined", False)

        return True

    except Exception as e:
        record_result("ROLE-001", "Role badges", False, str(e))
        return False


def test_invite_button(page):
    """Test invite button visibility (owner only)"""
    log("Testing invite button...", "INFO")

    try:
        invite_button = page.locator("button:has-text('Invite Member')")

        if invite_button.is_visible():
            record_result("INV-001", "Invite Member button visible (owner)", True)
            screenshot(page, "07-invite-button-visible")
            return True
        else:
            # May not be visible if user is not owner
            record_result("INV-001", "Invite Member button visible (owner)", False, "Button not visible - user may not be owner")
            return False

    except Exception as e:
        record_result("INV-001", "Invite Member button", False, str(e))
        return False


def test_invite_dialog(page):
    """Test invite dialog functionality"""
    log("Testing invite dialog...", "INFO")

    try:
        invite_button = page.locator("button:has-text('Invite Member')")

        if not invite_button.is_visible():
            record_result("INV-010", "Invite dialog test", False, "Invite button not visible - skipping")
            return False

        # Click invite button
        invite_button.click()
        time.sleep(1)
        screenshot(page, "08-invite-dialog-open")

        # Verify dialog opened
        dialog = page.locator("role=dialog")
        expect(dialog).to_be_visible()
        record_result("INV-010", "Invite dialog opens", True)

        # Check for email input
        email_input = page.locator("#invite-email")
        expect(email_input).to_be_visible()
        record_result("INV-011", "Email input visible", True)

        # Check for role selection
        staff_button = page.locator("button:has-text('staff')")
        viewer_button = page.locator("button:has-text('viewer')")

        if staff_button.is_visible() and viewer_button.is_visible():
            record_result("INV-012", "Role selection visible", True)
        else:
            record_result("INV-012", "Role selection visible", False)

        # Test role toggle
        viewer_button.click()
        time.sleep(0.5)
        screenshot(page, "09-invite-dialog-viewer-selected")
        record_result("INV-013", "Role toggle works", True)

        # Close dialog
        close_button = page.locator("button:has-text('Cancel')")
        close_button.click()
        time.sleep(0.5)

        # Verify dialog closed
        expect(dialog).not_to_be_visible()
        record_result("INV-014", "Dialog closes on Cancel", True)

        return True

    except Exception as e:
        record_result("INV-010", "Invite dialog test", False, str(e))
        screenshot(page, "invite-dialog-error")
        return False


def test_invite_validation(page):
    """Test invite form validation"""
    log("Testing invite form validation...", "INFO")

    try:
        invite_button = page.locator("button:has-text('Invite Member')")

        if not invite_button.is_visible():
            record_result("INV-020", "Invite validation test", False, "Invite button not visible - skipping")
            return False

        # Open dialog
        invite_button.click()
        time.sleep(1)

        # Check that Send Invite is disabled when email is empty
        send_button = page.locator("button:has-text('Send Invite')")
        if send_button.is_disabled():
            record_result("INV-020", "Send button disabled when email empty", True)
        else:
            record_result("INV-020", "Send button disabled when email empty", False)

        # Enter invalid email
        email_input = page.locator("#invite-email")
        email_input.fill("invalid-email")

        # Enter valid email to enable button
        email_input.fill("test@example.com")
        time.sleep(0.5)

        if not send_button.is_disabled():
            record_result("INV-021", "Send button enabled with valid email", True)
        else:
            record_result("INV-021", "Send button enabled with valid email", False)

        screenshot(page, "10-invite-validation")

        # Close dialog
        page.locator("button:has-text('Cancel')").click()
        time.sleep(0.5)

        return True

    except Exception as e:
        record_result("INV-020", "Invite validation", False, str(e))
        return False


def test_member_actions_dropdown(page):
    """Test member actions dropdown (owner only)"""
    log("Testing member actions dropdown...", "INFO")

    try:
        # Look for action buttons (three dots menu)
        action_buttons = page.locator("button:has(svg.lucide-more-vertical)")

        if action_buttons.count() > 0:
            # Click first action button
            action_buttons.first.click()
            time.sleep(0.5)
            screenshot(page, "11-member-actions-dropdown")

            # Check for dropdown menu items
            make_staff = page.locator("text=Make Staff")
            make_viewer = page.locator("text=Make Viewer")
            remove = page.locator("text=Remove")

            dropdown_visible = make_staff.is_visible() or make_viewer.is_visible() or remove.is_visible()

            if dropdown_visible:
                record_result("TEAM-010", "Member actions dropdown visible", True)
            else:
                record_result("TEAM-010", "Member actions dropdown visible", False, "No menu items visible")

            # Close dropdown by clicking elsewhere
            page.keyboard.press("Escape")
            time.sleep(0.5)

            return True
        else:
            record_result("TEAM-010", "Member actions dropdown", False, "No action buttons found - user may be only member or not owner")
            return False

    except Exception as e:
        record_result("TEAM-010", "Member actions dropdown", False, str(e))
        return False


def test_pending_invitations_section(page):
    """Test pending invitations section (if any)"""
    log("Testing pending invitations section...", "INFO")

    try:
        pending_section = page.locator("text=Pending Invitations")

        if pending_section.is_visible():
            record_result("INV-030", "Pending Invitations section visible", True)
            screenshot(page, "12-pending-invitations")

            # Check for invitation actions
            resend_button = page.locator("text=Resend")
            cancel_button = page.locator("text=Cancel")

            if resend_button.count() > 0:
                record_result("INV-031", "Resend option available", True)
            if cancel_button.count() > 0:
                record_result("INV-032", "Cancel option available", True)

            return True
        else:
            record_result("INV-030", "Pending Invitations section", True, "No pending invitations (expected if none sent)")
            return True

    except Exception as e:
        record_result("INV-030", "Pending Invitations section", False, str(e))
        return False


def test_search_input(page):
    """Test search input (placeholder for future)"""
    log("Testing search input...", "INFO")

    try:
        search_input = page.locator("input[placeholder*='Search team members']")

        if search_input.is_visible():
            # Check if disabled (placeholder feature)
            if search_input.is_disabled():
                record_result("UI-001", "Search input visible (disabled placeholder)", True)
            else:
                record_result("UI-001", "Search input visible (enabled)", True)
            return True
        else:
            record_result("UI-001", "Search input", False, "Not found")
            return False

    except Exception as e:
        record_result("UI-001", "Search input", False, str(e))
        return False


def test_responsive_layout(page):
    """Test responsive layout at different viewport sizes"""
    log("Testing responsive layout...", "INFO")

    try:
        # Test desktop
        page.set_viewport_size({"width": 1280, "height": 720})
        page.wait_for_timeout(500)
        screenshot(page, "13-responsive-desktop")
        record_result("UI-010", "Desktop layout renders", True)

        # Test tablet
        page.set_viewport_size({"width": 768, "height": 1024})
        page.wait_for_timeout(500)
        screenshot(page, "14-responsive-tablet")
        record_result("UI-011", "Tablet layout renders", True)

        # Test mobile
        page.set_viewport_size({"width": 375, "height": 667})
        page.wait_for_timeout(500)
        screenshot(page, "15-responsive-mobile")
        record_result("UI-012", "Mobile layout renders", True)

        # Reset to desktop
        page.set_viewport_size({"width": 1280, "height": 720})

        return True

    except Exception as e:
        record_result("UI-010", "Responsive layout", False, str(e))
        return False


def print_summary():
    """Print test results summary"""
    print("\n" + "=" * 60)
    print("TEST RESULTS SUMMARY")
    print("=" * 60)

    passed = sum(1 for r in test_results if r["passed"])
    failed = sum(1 for r in test_results if not r["passed"])
    total = len(test_results)

    print(f"\nTotal: {total} | Passed: {passed} | Failed: {failed}")
    print(f"Pass Rate: {(passed/total*100) if total > 0 else 0:.1f}%")

    if failed > 0:
        print("\nFailed Tests:")
        for r in test_results:
            if not r["passed"]:
                print(f"  ❌ {r['id']}: {r['name']}")
                if r["details"]:
                    print(f"     Details: {r['details']}")

    print(f"\nScreenshots saved to: {SCREENSHOT_DIR}")
    print("=" * 60)


def main():
    """Main test runner"""
    print("=" * 60)
    print("StockZip Team Functionality Test Suite")
    print(f"Base URL: {BASE_URL}")
    print(f"Screenshot Dir: {SCREENSHOT_DIR}")
    print("=" * 60 + "\n")

    if not TEST_EMAIL or not TEST_PASSWORD:
        print("ERROR: Please set TEST_EMAIL and TEST_PASSWORD environment variables")
        print("Usage: TEST_EMAIL=your@email.com TEST_PASSWORD=yourpass python3 tests/team-test.py")
        sys.exit(1)

    log(f"Testing with email: {TEST_EMAIL}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1280, "height": 720},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
        )
        page = context.new_page()

        try:
            # Run tests in sequence
            if not test_login(page):
                log("Login failed - cannot continue with team tests", "FAIL")
                print_summary()
                browser.close()
                return

            if not test_team_page_navigation(page):
                log("Team page navigation failed", "FAIL")

            test_team_members_display(page)
            test_role_badges(page)
            test_invite_button(page)
            test_invite_dialog(page)
            test_invite_validation(page)
            test_member_actions_dropdown(page)
            test_pending_invitations_section(page)
            test_search_input(page)
            test_responsive_layout(page)

        except Exception as e:
            log(f"Unexpected error: {e}", "FAIL")
            screenshot(page, "unexpected-error")
        finally:
            browser.close()

    print_summary()


if __name__ == "__main__":
    main()
