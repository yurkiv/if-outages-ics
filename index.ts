import {
	addDays,
	addHours,
	format,
	parse,
	startOfWeek
} from "date-fns";
import { createEvents } from "ics";
import { mkdir, writeFile } from "node:fs/promises";

const BASE_URL = "https://be-svitlo.oe.if.ua/schedule-by-queue";

// All available queues
const QUEUES = [
	"1.1", "1.2",
	"2.1", "2.2",
	"3.1", "3.2",
	"4.1", "4.2",
	"5.1", "5.2",
	"6.1", "6.2"
];

async function fetchQueueSchedule(queue: string) {
	const url = `${BASE_URL}?queue=${queue}`;
	console.log(`Fetching schedule for queue ${queue}...`);
	
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return await response.json();
	} catch (error) {
		console.error(`Error fetching queue ${queue}:`, error);
		return [];
	}
}

interface ShutdownEvent {
	shutdownHours: string;
	from: string;
	to: string;
	status: number;
}

interface ScheduleData {
	eventDate: string;
	queues: Record<string, ShutdownEvent[]>;
	createdAt: string;
	scheduleApprovedSince: string;
}

function timeToMinutes(timeStr: string): number {
	const [hours, minutes] = timeStr.split(":").map(Number);
	return hours * 60 + minutes;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
	const [day, month, year] = dateStr.split(".").map(Number);
	const [hours, minutes] = timeStr.split(":").map(Number);
	return new Date(year, month - 1, day, hours, minutes, 0);
}

async function generateICSForQueue(queue: string, scheduleData: ScheduleData[]) {
	const events = [];

	for (const schedule of scheduleData) {
		const queueEvents = schedule.queues[queue];
		
		if (!queueEvents || queueEvents.length === 0) {
			continue;
		}

		for (const event of queueEvents) {
			const startDate = parseDateTime(schedule.eventDate, event.from);
			const endDate = parseDateTime(schedule.eventDate, event.to);

			// Handle case where outage spans midnight
			if (endDate <= startDate) {
				endDate.setDate(endDate.getDate() + 1);
			}

			events.push({
				title: "Electricity Outage",
				start: [
					startDate.getFullYear(),
					startDate.getMonth() + 1,
					startDate.getDate(),
					startDate.getHours(),
					startDate.getMinutes()
				],
				end: [
					endDate.getFullYear(),
					endDate.getMonth() + 1,
					endDate.getDate(),
					endDate.getHours(),
					endDate.getMinutes()
				],
				description: `Queue: ${queue}\nOutage hours: ${event.shutdownHours}`
			});
		}
	}

	const res = createEvents(events);
	if (res.error) {
		console.error(`Error creating ICS for queue ${queue}:`, res.error);
		throw res.error;
	}

	await mkdir("./out", { recursive: true });
	const filename = `./out/queue_${queue.replace(".", "_")}.ics`;
	await writeFile(filename, res.value);
	console.log(`Generated ${filename}${events.length === 0 ? " (no outages)" : ""}`);
}

async function main() {
	console.log("Starting schedule download...");
	
	for (const queue of QUEUES) {
		const scheduleData = await fetchQueueSchedule(queue);
		await generateICSForQueue(queue, scheduleData);
	}

	console.log("Done!");
}

main().catch(console.error);
