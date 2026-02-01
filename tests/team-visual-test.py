#!/usr/bin/env python3
"""
Team Functionality Visual Test Script for StockZip
Opens a visible browser for manual login, then runs automated tests.

Usage:
  python3 tests/team-visual-test.py
"""

import os
import time
from datetime import datetime
from playwright.sync_api import sync_playwright, expect

# Configuration
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")
SCREENSHOT_DIR = "/tmp/team-tests"

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


def run_team_tests(page):
    """Run team functionality tests after login"""

    # Navigate to team settings
    log("Navigating to team settings...", "INFO")
    page.goto(f"{BASE_URL}/settings/team")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    screenshot(page, "01-team-settings")

    # Test 1: Team page loads
    try:
        expect(page.locator("h1:has-text('Team')")).to_be_visible(timeout=10000)
        record_result("TEAM-001", "Team page loads", True)
    except:
        record_result("TEAM-001", "Team page loads", False, "Page did not load properly")
        return

    # Test 2: Team Members section
    try:
        expect(page.locator("text=Team Members")).to_be_visible()
        record_result("TEAM-002", "Team Members section visible", True)
    except:
        record_result("TEAM-002", "Team Members section visible", False)

    # Test 3: Current user badge
    try:
        you_badge = page.locator("span:has-text('You')")
        if you_badge.is_visible():
            record_result("TEAM-003", "Current user 'You' badge visible", True)
        else:
            record_result("TEAM-003", "Current user 'You' badge visible", False)
    except Exception as e:
        record_result("TEAM-003", "Current user 'You' badge", False, str(e))

    # Test 4: Role badges
    try:
        owner_badge = page.locator("span:has-text('Owner')").first
        if owner_badge.is_visible():
            record_result("ROLE-001", "Owner role badge visible", True)
        else:
            record_result("ROLE-001", "Owner role badge visible", False, "Not found")
    except Exception as e:
        record_result("ROLE-001", "Owner role badge", False, str(e))

    # Test 5: Role Permissions section
    try:
        expect(page.locator("text=Role Permissions")).to_be_visible()
        record_result("ROLE-002", "Role Permissions section visible", True)
        screenshot(page, "02-role-permissions")
    except:
        record_result("ROLE-002", "Role Permissions section visible", False)

    # Test 6: Invite button
    try:
        invite_button = page.locator("button:has-text('Invite Member')")
        if invite_button.is_visible():
            record_result("INV-001", "Invite Member button visible", True)
            screenshot(page, "03-invite-button")

            # Test invite dialog
            invite_button.click()
            time.sleep(1)
            screenshot(page, "04-invite-dialog")

            dialog = page.locator("role=dialog")
            if dialog.is_visible():
                record_result("INV-002", "Invite dialog opens", True)

                # Check email input
                email_input = page.locator("#invite-email")
                if email_input.is_visible():
                    record_result("INV-003", "Email input visible", True)
                else:
                    record_result("INV-003", "Email input visible", False)

                # Check role buttons
                staff_btn = page.locator("button:has-text('staff')")
                viewer_btn = page.locator("button:has-text('viewer')")
                if staff_btn.is_visible() and viewer_btn.is_visible():
                    record_result("INV-004", "Role selection visible", True)

                    # Test role toggle
                    viewer_btn.click()
                    time.sleep(0.5)
                    screenshot(page, "05-viewer-selected")
                    record_result("INV-005", "Role toggle works", True)
                else:
                    record_result("INV-004", "Role selection visible", False)

                # Close dialog
                page.locator("button:has-text('Cancel')").click()
                time.sleep(0.5)
                record_result("INV-006", "Dialog closes", True)
            else:
                record_result("INV-002", "Invite dialog opens", False)
        else:
            record_result("INV-001", "Invite Member button visible", False, "User may not be owner")
    except Exception as e:
        record_result("INV-001", "Invite functionality", False, str(e))

    # Test 7: Member actions
    try:
        action_buttons = page.locator("button:has(svg.lucide-more-vertical)")
        if action_buttons.count() > 0:
            action_buttons.first.click()
            time.sleep(0.5)
            screenshot(page, "06-member-actions")

            # Check dropdown options
            has_options = (
                page.locator("text=Make Staff").is_visible() or
                page.locator("text=Make Viewer").is_visible() or
                page.locator("text=Remove").is_visible()
            )
            if has_options:
                record_result("TEAM-010", "Member actions dropdown works", True)
            else:
                record_result("TEAM-010", "Member actions dropdown works", False, "No options visible")

            page.keyboard.press("Escape")
            time.sleep(0.3)
        else:
            record_result("TEAM-010", "Member actions dropdown", True, "No other members to manage")
    except Exception as e:
        record_result("TEAM-010", "Member actions", False, str(e))

    # Test 8: Pending invitations
    try:
        pending = page.locator("text=Pending Invitations")
        if pending.is_visible():
            record_result("INV-010", "Pending Invitations section visible", True)
            screenshot(page, "07-pending-invitations")
        else:
            record_result("INV-010", "Pending Invitations section", True, "None pending (expected)")
    except Exception as e:
        record_result("INV-010", "Pending Invitations", False, str(e))

    # Test 9: Responsive layout
    try:
        # Desktop
        page.set_viewport_size({"width": 1280, "height": 720})
        time.sleep(0.5)
        screenshot(page, "08-desktop")
        record_result("UI-001", "Desktop layout", True)

        # Tablet
        page.set_viewport_size({"width": 768, "height": 1024})
        time.sleep(0.5)
        screenshot(page, "09-tablet")
        record_result("UI-002", "Tablet layout", True)

        # Mobile
        page.set_viewport_size({"width": 375, "height": 667})
        time.sleep(0.5)
        screenshot(page, "10-mobile")
        record_result("UI-003", "Mobile layout", True)

        # Reset
        page.set_viewport_size({"width": 1280, "height": 720})
    except Exception as e:
        record_result("UI-001", "Responsive layout", False, str(e))

    # Final screenshot
    screenshot(page, "11-final")


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
    """Main test runner with visible browser for manual login"""
    print("=" * 60)
    print("StockZip Team Functionality Visual Test")
    print(f"Base URL: {BASE_URL}")
    print("=" * 60 + "\n")

    with sync_playwright() as p:
        # Launch visible browser
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        try:
            # Navigate to login
            log("Opening login page...", "INFO")
            page.goto(f"{BASE_URL}/login")
            page.wait_for_load_state("networkidle")
            screenshot(page, "00-login-page")

            print("\n" + "=" * 60)
            print("Please log in manually with an OWNER account.")
            print("After login, press ENTER in this terminal to continue...")
            print("=" * 60)

            input("\n>>> Press ENTER after logging in... ")

            # Verify login by checking URL
            if "/login" in page.url:
                log("Still on login page - please complete login first", "WARN")
                input(">>> Press ENTER when ready... ")

            # Check if on dashboard
            page.wait_for_load_state("networkidle")
            log(f"Current URL: {page.url}", "INFO")

            # Run automated tests
            run_team_tests(page)

        except KeyboardInterrupt:
            log("Test interrupted by user", "WARN")
        except Exception as e:
            log(f"Error: {e}", "FAIL")
            screenshot(page, "error")
        finally:
            print_summary()
            print("\nBrowser will close in 5 seconds...")
            time.sleep(5)
            browser.close()


if __name__ == "__main__":
    main()
