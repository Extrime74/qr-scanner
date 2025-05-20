class ScanResultsController < ApplicationController
  def show
    scan_data = JSON.parse(session[:last_scan] || "{}").with_indifferent_access

    if scan_data.blank?
      redirect_to scanner_path, alert: "Не найдено данных последнего сканирования"
    else
      @qr_text = scan_data[:text]
      @screenshot = scan_data[:image]
      @scan_date = scan_data[:date]

      # Очищаем данные после показа
      session.delete(:last_scan)
    end
  end
end
