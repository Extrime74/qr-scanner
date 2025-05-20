class ScannerController < ApplicationController
  def index
    session.delete(:qr_text) if params[:reset]
    session.delete(:qr_image) if params[:reset]
    session.delete(:qr_date) if params[:reset]
  end

  def back
    redirect_to scanner_path(reset: true)
  end
end
