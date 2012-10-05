ImageUploader::Application.routes.draw do
  post 'attachments' => 'images#create' # Uploads!
end
