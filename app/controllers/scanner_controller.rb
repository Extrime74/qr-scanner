class ScannerController < ApplicationController
  def index
    sessionStorage.removeItem("qr_data") if params[:reset]
  end

  def back
    redirect_to scanner_path(reset: true)
  end
end
