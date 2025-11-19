require 'net/http'
require 'json'
require 'fileutils'
require 'time'
require 'icalendar'

BASE_URL = "https://be-svitlo.oe.if.ua/schedule-by-queue"
QUEUES = [
  "1.1", "1.2",
  "2.1", "2.2",
  "3.1", "3.2",
  "4.1", "4.2",
  "5.1", "5.2",
  "6.1", "6.2"
]

def fetch_queue_schedule(queue)
  uri = URI("#{BASE_URL}?queue=#{queue}")
  puts "Fetching schedule for queue #{queue}..."
  
  begin
    response = Net::HTTP.get_response(uri)
    if response.is_a?(Net::HTTPSuccess)
      JSON.parse(response.body)
    else
      puts "HTTP error! status: #{response.code}"
      []
    end
  rescue StandardError => e
    puts "Error fetching queue #{queue}: #{e.message}"
    []
  end
end

def parse_date_time(date_str, time_str)
  day, month, year = date_str.split('.').map(&:to_i)
  hours, minutes = time_str.split(':').map(&:to_i)
  Time.new(year, month, day, hours, minutes, 0)
end

def generate_ics_for_queue(queue, schedule_data)
  events_count = 0
  cal = Icalendar::Calendar.new
  
  # Always create the output directory
  FileUtils.mkdir_p("./out")
  
  schedule_data.each do |schedule|
    queue_events = schedule.dig('queues', queue)
    next if queue_events.nil? || queue_events.empty?

    queue_events.each do |event_info|
      start_time = parse_date_time(schedule['eventDate'], event_info['from'])
      end_time = parse_date_time(schedule['eventDate'], event_info['to'])

      # Handle case where outage spans midnight
      if end_time <= start_time
        end_time += 86400 # Add 1 day in seconds
      end

      duration_seconds = end_time - start_time
      duration_hours = (duration_seconds / 3600).floor
      duration_minutes = ((duration_seconds % 3600) / 60).floor
      duration_str = "#{duration_hours}h"
      duration_str += " #{duration_minutes}m" if duration_minutes > 0

      cal.event do |e|
        e.dtstart = start_time
        e.dtend = end_time
        e.summary = "Electricity Outage for #{duration_str}"
        e.description = "Queue: #{queue}\nOutage hours: #{event_info['shutdownHours']}"
      end
      events_count += 1
    end
  end

  filename = "./out/queue_#{queue.gsub('.', '_')}.ics"
  File.write(filename, cal.to_ical)
  puts "Generated #{filename}#{events_count == 0 ? ' (no outages)' : ''}"
end

def main
  puts "Starting schedule download..."
  
  QUEUES.each do |queue|
    schedule_data = fetch_queue_schedule(queue)
    generate_ics_for_queue(queue, schedule_data)
  end

  puts "Done!"
end

if __FILE__ == $0
  main
end

