require 'test_helper'

class TextImagesControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get text_images_show_url
    assert_response :success
  end

end
