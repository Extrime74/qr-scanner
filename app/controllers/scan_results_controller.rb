class ScanResultsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :save ] # Отключаем CSRF для этого действия

  def show
    @qr_text = session[:qr_text]
    @screenshot = session[:qr_image]
    @scan_date = session[:qr_date]

    if @qr_text.blank?
      redirect_to scanner_path, alert: "Не найдено данных последнего сканирования"
      nil
    end
  end

  def save
    session[:qr_text] = params[:text]
    session[:qr_image] = params[:image]
    session[:qr_date] = params[:date]

    render json: { status: "success" }
  rescue => e
    Rails.logger.error "Ошибка сохранения скана: #{e.message}"
    render json: { status: "error", message: e.message }, status: 500
  end
end
