class Admin::ImagesController < ApplicationController
  
  def create

    file = params[:attachment][:file]
    
    file_string = "#{Rails.root.to_s}/tmp/#{ params[:attachment][:uid] }#{ File.extname(file.original_filename.to_s) }"
    
    FileUtils.mv file.tempfile.to_path.to_s, file_string
    
    uploaded_file = File.open(file_string, "r")

    image = Image.new 
    image.file = uploaded_file

    if image.save
      FileUtils.rm uploaded_file
      render :json => image
    else
      render :json => image.errors
    end

  end

end