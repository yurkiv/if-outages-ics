# IF Outages ICS

Auto-generated schedule of power outages for Ivano-Frankivsk region with data from [svitlo.oe.if.ua](https://svitlo.oe.if.ua/).

## Overview

This script fetches electrical outage schedules for all queues (1.1 - 6.2) in the Ivano-Frankivsk region from the BE Svitlo API and generates `.ics` calendar files for each queue.

## Published Calendars

Calendar files are automatically published and updated every 10 minutes:

📅 **Browse calendars:** https://yurkiv.github.io/if-outages-ics/

Each queue has its own calendar file:
- `queue_1_1.ics`, `queue_1_2.ics`
- `queue_2_1.ics`, `queue_2_2.ics`
- ... and so on for queues 3-6

## Home Assistant Integration

You can integrate these calendars with [Home Assistant](https://www.home-assistant.io/) using the [Remote Calendar integration](https://www.home-assistant.io/integrations/remote_calendar/):

1. Go to **Settings > Devices & Services > Add Integration > Remote Calendar**
2. Enter a name for your calendar (e.g., "Queue 1.1 Outages")
3. Use the calendar URL: `https://yurkiv.github.io/if-outages-ics/queue_X_Y.ics` (replace `X_Y` with your queue number)
4. Create automations to notify you or trigger actions before scheduled outages


## Features

- Fetches outage schedules for all 12 queues (1.1, 1.2, 2.1, 2.2, ..., 6.1, 6.2)
- Parses schedule data with dates and times
- Handles outages that span midnight
- Generates individual ICS calendar files for each queue
- Includes error handling and logging

## Installation

```bash
bundle install
```

## Usage

```bash
bundle exec ruby index.rb
```

This will:
1. Fetch schedule data for all queues from the API
2. Generate `.ics` files in the `./out` directory
3. Create files named `queue_X_Y.ics` for each queue

## Output

Generated `.ics` files can be imported into any calendar application (Google Calendar, Apple Calendar, Outlook, etc.)

## Data Source

- API: `https://be-svitlo.oe.if.ua/schedule-by-queue`
- Region: Ivano-Frankivsk (Ukraine)
- Update frequency: Every 10 minutes
