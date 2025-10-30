# IF Outages ICS

Auto-generated schedule of power outages for Ivano-Frankivsk region with data from [BE Svitlo](https://be-svitlo.oe.if.ua).

## Overview

This script fetches electrical outage schedules for all queues (1.1 - 6.2) in the Ivano-Frankivsk region from the BE Svitlo API and generates `.ics` calendar files for each queue.

## Features

- Fetches outage schedules for all 12 queues (1.1, 1.2, 2.1, 2.2, ..., 6.1, 6.2)
- Parses schedule data with dates and times
- Handles outages that span midnight
- Generates individual ICS calendar files for each queue
- Includes error handling and logging

## Installation

```bash
bun install
```

## Usage

```bash
bun run index.ts
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
