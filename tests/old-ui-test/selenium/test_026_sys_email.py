# Author: Rishabh Chauhan
# License: BSD
# Location for tests  of FreeNAS new GUI
# Test case count: 2

import sys
import os
import time
cwd = str(os.getcwd())
sys.path.append(cwd)
from function import take_screenshot


skip_mesages = "Skipping first run"
script_name = os.path.basename(__file__).partition('.')[0]

xpaths = {
    'outgoingMail': "//div[@id='outgoingserver']/mat-form-field/div/div/div/input",
    'navSystem': "//span[contains(.,'System')]",
    'submenuEmail': "//a[contains(.,'Email')]",
    'breadcrumbBar1': "//div[@id='breadcrumb-bar']/ul/li/a",
    'breadcrumbBar2': "//*[@id='breadcrumb-bar']/ul/li[2]/a"

}


def test_01_nav_system_email(browser):
    # driver.find_element_by_xpath(xpaths['navSystem']).click()
    time.sleep(1)
    browser.find_element_by_xpath(xpaths['submenuEmail']).click()
    # get the ui element
    ui_element = browser.find_element_by_xpath(xpaths['breadcrumbBar1'])
    # get the weather data
    page_data = ui_element.text
    # assert response
    assert "System" in page_data, page_data
    # get the ui element
    ui_element = browser.find_element_by_xpath(xpaths['breadcrumbBar2'])
    # get the weather data
    page_data = ui_element.text
    # assert response
    assert "Email" in page_data, page_data
    # taking screenshot
    test_name = sys._getframe().f_code.co_name
    take_screenshot(browser, script_name, test_name)


def test_02_configure_email(browser):
    # Close the System Tab
    browser.find_element_by_xpath(xpaths['outgoingMail']).clear()
    browser.find_element_by_xpath(xpaths['outgoingMail']).send_keys("test@ixsystems.com")
    browser.find_element_by_xpath('//*[@id="save_button"]').click()
    time.sleep(5)
    # taking screenshot
    test_name = sys._getframe().f_code.co_name
    take_screenshot(browser, script_name, test_name)
