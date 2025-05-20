require "test_helper"

class ScanResultsControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get scan_results_show_url
    assert_response :success
  end
end
