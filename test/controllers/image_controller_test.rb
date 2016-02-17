require 'test_helper'

class ImageControllerTest < ActionDispatch::IntegrationTest
  test "should get new" do
    get image_new_url
    assert_response :success
  end

  test "should get create" do
    get image_create_url
    assert_response :success
  end

  test "should get show" do
    get image_show_url
    assert_response :success
  end

end
