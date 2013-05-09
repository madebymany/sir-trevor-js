class Image < ActiveRecord::Base
  self.table_name = 'sir_trevor_images'
	mount_uploader :file, ImageUploader
	validates :file, :presence => true
end