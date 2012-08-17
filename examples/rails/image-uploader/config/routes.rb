ImageUploader::Application.routes.draw do
  post 'images' => 'images#create' # Uploads!
end
