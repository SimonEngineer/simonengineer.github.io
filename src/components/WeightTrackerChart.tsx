"use client"

import {TrendingDown} from "lucide-react"
import {CartesianGrid, Legend, Line, LineChart, ReferenceLine, XAxis, YAxis} from "recharts"

import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    type ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Label} from "@/components/ui/label";
import { useState} from "react";
import type {WeightData} from "@/utils/weightTracker/weightTrackerHandler.ts";


function GetMinByDate<T extends { date: string }>(data: T[]) {
    return data.reduce((min, curr) => (ConvertStringDateToDate(curr.date) < ConvertStringDateToDate(min.date) ? curr : min), data[0]);
}

function GetMaxByDate<T extends { date: string }>(data: T[]) {
    return data.reduce((max, curr) => (ConvertStringDateToDate(max.date) > ConvertStringDateToDate(curr.date) ? max : curr), data[0]);
}


//SWB - Since Winter Break
//SNY - Since New Years
const projectionKeys = ['155g-Day-SNY', '150g-Day-SWB', '200g-Day-SWB', '250g-Day-SWB', '300g-Day-SWB','interpolated-data'] as const;
type ProjectionKey = (typeof projectionKeys)[number];
const projectionColorOptions: string[] = ["green", "yellow", "aqua", "beige", "blue"];


type DataWithProjections = { [key in ProjectionKey]?: number } & {
    weight?: number;
    date: string,
    interpolated?: boolean
}
type WeightDataPoint = { weight: number, date: string, interpolated?: boolean }
type WeightTrackerProjection = { key: ProjectionKey, projections: WeightDataPoint[], }


function AddAdditionalLinesToGraph(initialDataSet: WeightDataPoint[], lines: WeightTrackerProjection[]): DataWithProjections[] {

    const aggregatedData: DataWithProjections[] = [];
    const minProjectedWeight = GetMinByDate(lines.map(a => ({date: GetMinByDate(a.projections).date})));
    const maxProjectedWeight = GetMaxByDate(lines.map(a => ({date: GetMaxByDate(a.projections).date})));
    const minWeightDataSet = GetMinByDate(initialDataSet);
    const maxWeightDataSet = GetMaxByDate(initialDataSet);

    const minDate = ConvertStringDateToDate(minProjectedWeight.date) < ConvertStringDateToDate(minWeightDataSet.date) ? minProjectedWeight.date : minWeightDataSet.date;
    const maxDate = ConvertStringDateToDate(maxProjectedWeight.date) > ConvertStringDateToDate(maxWeightDataSet.date) ? maxProjectedWeight.date : maxWeightDataSet.date;


    let currentDateIndex = minDate;
    while (ConvertStringDateToDate(currentDateIndex) <= ConvertStringDateToDate(maxDate)) {

        const projectionLineDataPoint = lines.map(x => {
            const projectionDate = x.projections.find(p => p.date === currentDateIndex)
            return {key: x.key, dataPoint: projectionDate};
        });

        const registeredWeightDataPoint = initialDataSet.find(x => x.date === currentDateIndex);

        let currentDataPoint: DataWithProjections = {
            date: currentDateIndex,
            weight: registeredWeightDataPoint?.weight,
        }
        for (const currentDataPointElement of projectionLineDataPoint) {
            if (currentDataPointElement.dataPoint == undefined) continue
            currentDataPoint[currentDataPointElement.key] = currentDataPointElement.dataPoint.weight
        }
        aggregatedData.push(currentDataPoint)

        const date = ConvertStringDateToDate(currentDateIndex);
        date.setDate(date.getDate() + 1);
        currentDateIndex = date.toLocaleDateString("no", {dateStyle: "short"})
    }

    return aggregatedData;
}


function CreatePlannedWeightLoss(startData: { weight: number, date: string }, daylyLoss: number, targetWeight: number) {
    const entries: { weight: number, date: string }[] = [startData];
    while (entries[entries.length - 1].weight > targetWeight) {
        const lastEntry = entries[entries.length - 1];
        const date = ConvertStringDateToDate(lastEntry.date);
        const formattedDate = new Date(date.setDate(date.getDate() + 1)).toLocaleDateString("no", {dateStyle: "short"});
        entries.push({weight: Number((lastEntry.weight - daylyLoss).toFixed(2)), date: formattedDate});
    }
    return entries;

}

function InterpolateMissingData(data: WeightDataPoint[]) {
    const startDate = GetMinByDate(data)
    const endDate = GetMaxByDate(data)?.date ?? (new Date()).toLocaleDateString("no", {dateStyle: "short"});
    let currentDateIndex = startDate.date;
    const interpolatedData: WeightDataPoint[] = [];
    while (ConvertStringDateToDate(currentDateIndex) <= ConvertStringDateToDate(endDate)) {
        const dataPoint = data.find(x => x.date === currentDateIndex);
        if (dataPoint && dataPoint.weight) {
            interpolatedData.push({weight: dataPoint.weight, date: dataPoint.date, interpolated: false});
        } else {

            const interpolatedValue = interpolatedData[interpolatedData.length - 1].weight
            interpolatedData.push({weight: interpolatedValue, date: currentDateIndex, interpolated: true});
        }

        const date = ConvertStringDateToDate(currentDateIndex);
        date.setDate(date.getDate() + 1);
        currentDateIndex = date.toLocaleDateString("no", {dateStyle: "short"})
    }
    return interpolatedData;

}


const chartConfig = {
    date: {
        label: "date",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig


function ConvertStringDateToDate(date: string): Date {
    return new Date(date.split(".").reverse().join("."))
}

export function WeightTrackerChart({weightData}: { weightData: WeightData[] }) {
    const [isMilestonesVisible, setIsMilestonesVisible] = useState(false);
    const startingWeightForProjectionAfterWinterBreak = {weight: 94.40, date: "03.03.2025"}

    const plannedWeightLoss = CreatePlannedWeightLoss({weight: 98.50, date: "02.01.2025"}, 0.155, 80);
    const plannedWeightLossAfterWinterBreak = CreatePlannedWeightLoss(startingWeightForProjectionAfterWinterBreak, 0.155, 80);
    const plannedWeightLossAfterWinterBreak200g = CreatePlannedWeightLoss(startingWeightForProjectionAfterWinterBreak, 0.2, 80);
    const plannedWeightLossAfterWinterBreak250g = CreatePlannedWeightLoss(startingWeightForProjectionAfterWinterBreak, 0.25, 80);
    const plannedWeightLossAfterWinterBreak300g = CreatePlannedWeightLoss(startingWeightForProjectionAfterWinterBreak, 0.3, 80);

    const filteredData = weightData.filter(x => ConvertStringDateToDate(x.date) >= new Date(2025, 0, 1));
    // const interpolatedData = InterpolateMissingData(filteredData).filter(x=>x.interpolated);
    const interpolatedData = InterpolateMissingData(filteredData);

    const dataForGraph = AddAdditionalLinesToGraph(filteredData,
        [

            {
                key: "155g-Day-SNY", projections: plannedWeightLoss
            },
            {
                key: "150g-Day-SWB", projections: plannedWeightLossAfterWinterBreak
            },
            {
                key: "200g-Day-SWB", projections: plannedWeightLossAfterWinterBreak200g
            },
            {
                key: "250g-Day-SWB", projections: plannedWeightLossAfterWinterBreak250g
            },
            {
                key: "300g-Day-SWB", projections: plannedWeightLossAfterWinterBreak300g
            },{
                key: "interpolated-data", projections: interpolatedData
            }
        ]);

    const defaultShowLines: ProjectionKey[] = ["155g-Day-SNY", "150g-Day-SWB"]
    const [includeLines, setIncludeLines] = useState(projectionKeys.filter(x=>x!=='interpolated-data').map(
        (key) => {
            const dataExists = dataForGraph.some(x => x[key as ProjectionKey] !== undefined)
            return {key: key, include: dataExists, show: defaultShowLines.includes(key)};
        }
    ));


    function SetLineVisibility(lineKey: ProjectionKey, visible: boolean) {
        console.log(`Setting: ${lineKey} to ${visible}`);
        setIncludeLines(p => {
            p.forEach(x => {
                if (x.key === lineKey) {
                    x.show = visible;
                }
            })
            return [...p]
        })
    }


    // const weightAtStartMeasuringDate = filteredData.find(x => ConvertStringDateToDate(x.date).toDateString() == new Date("2025.01.02").toDateString())!;
    const weightAtStartMeasuringDate = GetMinByDate(filteredData)
    const latestMeasurement = filteredData[filteredData.length - 1]

    const weightReductionSince = ((weightAtStartMeasuringDate?.weight ?? latestMeasurement.weight) - latestMeasurement.weight).toFixed(1)

    function findClosestProjectedWeight(inputWeight: number, key: ProjectionKey) {
        let closestItem = dataForGraph[0];
        let minDifference = Math.abs(inputWeight - (closestItem[key] ?? 0));

        // Loop through the data to find the closest weight
        for (let i = 1; i < dataForGraph.length; i++) {
            let currentDifference = Math.abs(inputWeight - (dataForGraph[i][key] ?? 0));

            if (currentDifference < minDifference) {
                closestItem = dataForGraph[i];
                minDifference = currentDifference;
            }
        }
        return closestItem;
    }


    return (
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Weight tracker</CardTitle>
                    {/*<CardDescription>January - June 2024</CardDescription>*/}
                </CardHeader>
                <CardContent>
                    <div className={"flex flex-row"}>

                        <div className={"flex-[7] "}>
                            <ChartContainer config={chartConfig}
                                // style={{width: "75%"}}
                                // className={"border border-gray-300"}
                            >
                                <LineChart
                                    accessibilityLayer
                                    data={dataForGraph}
                                    margin={{
                                        left: 12,
                                        right: 12,
                                    }}
                                >
                                    <CartesianGrid vertical={false}/>
                                    <XAxis className={"mb-4"}
                                           dataKey="date"
                                           tickLine={false}

                                           height={100}
                                           tickMargin={30}
                                           angle={45}
                                           tickFormatter={(value) => {
                                               const date = ConvertStringDateToDate(value)
                                               return date.toLocaleString("no", {
                                                   day: "2-digit",
                                                   month: "short",
                                                   year: "numeric"
                                               })
                                           }}
                                    />
                                    <YAxis
                                        dataKey="weight"
                                        tickLine={false}
                                        // axisLine={false}
                                        domain={[80, "auto"]}
                                        tickFormatter={(value) => {
                                            return value;
                                        }}
                                    />

                                    <ChartTooltip
                                        cursor={false}
                                        labelFormatter={(value) => `${value} - ${ConvertStringDateToDate(value).toLocaleDateString("no", {weekday: "long"})}`}
                                        content={<ChartTooltipContent formatter={(value, dataName) => {
                                            if(dataName == "Measured-Interpolated") return
                                            var content = `${dataName}: Weight: ${value}`
                                            if (dataName == "Projection" || projectionKeys.includes(dataName as ProjectionKey)) {
                                                return content
                                            }
                                            return `${content} -> Lost since: ${(Number(value) - latestMeasurement.weight).toFixed(1)}`
                                        }}/>}

                                    />


                                    <ReferenceLine
                                        x={findClosestProjectedWeight(91.6, "155g-Day-SNY").date}
                                        stroke={"lightyellow"}
                                        strokeWidth={1}
                                        label={isMilestonesVisible ? {
                                            value: "Milestone 91.6kg original first goal",
                                            position: "insideBottomRight"
                                            // angle:45
                                        } : {}
                                        }
                                        style={{opacity: isMilestonesVisible ? 100 : 0}}
                                    />

                                    <ReferenceLine
                                        x={findClosestProjectedWeight(90, "155g-Day-SNY").date}
                                        stroke={"lightgreen"}
                                        strokeWidth={2}
                                        label={isMilestonesVisible ? {
                                            value: "Milestone 90kg",
                                            position: "insideBottomLeft"
                                        } : {}}
                                        spacing={10}
                                        style={{opacity: isMilestonesVisible ? 100 : 0}}
                                    />
                                    <ReferenceLine
                                        x={findClosestProjectedWeight(85, "155g-Day-SNY").date}
                                        stroke={"green"}
                                        strokeWidth={2}
                                        label={isMilestonesVisible ? {
                                            value: "Milestone 85kg",
                                            position: "insideBottomRight"
                                        } : {}}
                                        spacing={10}
                                        style={{opacity: isMilestonesVisible ? 100 : 0}}
                                    />
                                    <ReferenceLine
                                        x={findClosestProjectedWeight(80, "155g-Day-SNY").date}
                                        stroke={"green"}
                                        strokeWidth={4}
                                        label={isMilestonesVisible ? {
                                            value: "Milestone 80kg: Did i do it?",
                                            position: "insideRight"
                                        } : {}}
                                        spacing={10}
                                        style={{opacity: isMilestonesVisible ? 100 : 0}}
                                    />


                                    <Line
                                        dataKey="weight"
                                        type="bump"
                                        stroke="var(--color-date)"
                                        strokeWidth={2}
                                        dot={false}
                                        name={"Measured"}
                                        // connectNulls={true}

                                    />
                                    <Line
                                        dataKey="interpolated-data"
                                        type="bump"
                                        stroke="var(--color-date)"
                                        strokeWidth={2}
                                        dot={false}
                                        name={"Measured-Interpolated"}
                                        strokeDasharray={"3 3"}
                                        // connectNulls={true}

                                    />
                                    {includeLines.filter(x => x.include).map((line, idx) =>
                                        <Line
                                            hide={!line.show}
                                            dataKey={line.key}
                                            // legendType={"circle"}
                                            type="natural"
                                            stroke={projectionColorOptions[idx] ?? "yellow"}
                                            strokeWidth={2}
                                            dot={false}
                                            name={line.key}
                                            strokeDasharray={"5 5"}

                                        />
                                    )}
                                    <Legend/>

                                </LineChart>
                            </ChartContainer>
                        </div>
                        <div className={"flex-[2] flex flex-col justify-center space-y-2"}>
                            <Button variant={"secondary"}
                                    onClick={() => setIsMilestonesVisible(x => !x)}>{isMilestonesVisible ? "Hide milestones" : "Show milestones"}</Button>
                            <div className={"space-y-2 flex-[6] justify-center flex-col flex"}>
                                {includeLines.filter(x => x.include).map((line, idx) => {
                                        const color = projectionColorOptions[idx] ?? "yellow";
                                        return (
                                            <div className={"space-x-1 flex items-center"}
                                                 style={{color: color}} key={idx}>
                                                <Checkbox checked={line.show}
                                                          onCheckedChange={x => SetLineVisibility(line.key, x as boolean)}
                                                          style={{borderColor: color, backgroundColor: color}}/>
                                                <Label>{line.key}</Label>
                                            </div>
                                        )
                                    }
                                )}
                            </div>
                            {/*<div className={"flex-1"}></div>*/}
                        </div>
                    </div>
                    <CardFooter className="flex-col items-start gap-2 text-sm">
                        <div className="flex gap-2 font-medium leading-none">
                            Weight reduced by <span
                            className={"font-bold"}>{weightReductionSince} kg</span> since {ConvertStringDateToDate(weightAtStartMeasuringDate.date).toLocaleDateString("no")}
                            <TrendingDown className="h-4 w-4"/>
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Weighed <span
                            className={"font-bold"}>{weightAtStartMeasuringDate.weight} kg</span> at {ConvertStringDateToDate(weightAtStartMeasuringDate.date).toLocaleDateString("no")}
                        </div>
                        <div className="leading-none text-muted-foreground">
                            Weighed <span
                            className={"font-bold"}>{latestMeasurement.weight.toFixed(1)} kg</span> at {ConvertStringDateToDate(latestMeasurement.date).toLocaleDateString("no")}
                        </div>
                    </CardFooter>


                </CardContent>

            </Card>

        </div>
    )
}
