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
    'navTasks': "//span[contains(.,'Tasks')]",
    'submenuCloudsync': '//*[@id="3-8"]',
    'breadcrumbBar1': "//div[@id='breadcrumb-bar']/ul/li/a",
    'breadcrumbBar2': "//*[@id='breadcrumb-bar']/ul/li[2]/a",
    'toDashboard': "//span[contains(.,'Dashboard')]"
}


def test_01_nav_tasks_cloudsync(browser):
    browser.find_element_by_xpath(xpaths['submenuCloudsync']).click()
    # get the ui element
    ui_element = browser.find_element_by_xpath(xpaths['breadcrumbBar1'])
    # get the weather data
    page_data = ui_element.text
    # assert response
    assert "Tasks" in page_data, page_data
    # get the ui element
    ui_element = browser.find_element_by_xpath(xpaths['breadcrumbBar2'])
    # get the weather data
    page_data = ui_element.text
    # assert response
    assert "Cloud Sync Tasks" in page_data, page_data
    # taking screenshot
    test_name = sys._getframe().f_code.co_name
    take_screenshot(browser, script_name, test_name)
    time.sleep(1)


def test_02_return_to_dashboard(browser):
    # Close the System Tab
    browser.find_element_by_xpath(xpaths['toDashboard']).click()
    time.sleep(1)
    # get the ui element
    ui_element = browser.find_element_by_xpath(xpaths['breadcrumbBar1'])
    # get the weather data
    page_data = ui_element.text
    # assert response
    assert page_data == "Dashboard", page_data
    # taking screenshot
    test_name = sys._getframe().f_code.co_name
    take_screenshot(browser, script_name, test_name)
