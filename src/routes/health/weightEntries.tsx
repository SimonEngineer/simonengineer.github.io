import {createFileRoute, useRouter} from '@tanstack/react-router'
import {useState} from 'react'
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";

export const Route = createFileRoute('/health/weightEntries')({
    component: RouteComponent,
    loader: async ({context: {weightTrackerHandler}}) => await weightTrackerHandler.GetWeightData(),
})

function RouteComponent() {
    const router = useRouter()
    const routeContext = Route.useRouteContext()
    const data = Route.useLoaderData()
    const todaysDateFormatted = new Date().toLocaleDateString("no", {dateStyle: "short"})
    const [inputData, setInputData] = useState<{ weight?: number, date?: string }>({date: todaysDateFormatted});
    const [isChecked, setIsChecked] = useState<boolean>(true);
    const onSubmitAddWeightDate = async () => {
        if (!inputData || inputData.weight == undefined || inputData.date == undefined) {
            alert("Please enter values")
            return;
        }
        await routeContext.weightTrackerHandler.AddWeightData({
            weight: inputData.weight,
            date: inputData.date,
            time: "00:00",
            unit: "kg"
        });
        await router.invalidate({sync: true})

    }


    return <div className={""}>
        <h1>Weight registrations</h1>
        <div className={"flex w-full"}>
            <div className={"flex-1 h-96 overflow-y-scroll no-scrollbar "}>
                {data?.sort((a, b) => routeContext.weightTrackerHandler.ConvertStringDateToDate(b.date).getTime() - routeContext.weightTrackerHandler.ConvertStringDateToDate(a.date).getTime())
                    .map(x =>
                        <div>
                            {x.date}: {x.weight.toFixed(2)} {x.unit}
                            <br/>
                        </div>
                    )}
            </div>
            <div className={"flex-1"}>
                <Input type={"number"} value={inputData?.weight} onChange={x => {
                    setInputData(p => ({weight: Number(x.target.value), date: p?.date}))
                }} className={"w-50"} placeholder={"Weight"}/>
                <div className={"flex"}>

                    <Input disabled={isChecked}
                           type={"string"} value={inputData?.date}
                           onChange={x => setInputData(p => ({weight: p?.weight, date: x.target.value}))}
                           className={"w-50"} placeholder={"Date: {dd.MM.yyyy}"}/>
                    <Checkbox className={"h-8 w-8 ml-2 mt-1"} checked={isChecked} onClick={() => {
                        if (!isChecked) //Will become checked
                        {
                            //Update data before input is disabled
                            setInputData(p => ({
                                weight: p?.weight,
                                date: todaysDateFormatted
                            }))
                        }
                        setIsChecked(p => !p)
                    }}
                    />
                    <p className={"pt-2 pl-2"}>Use today's date</p>
                </div>
                <Button variant={"secondary"} onClick={onSubmitAddWeightDate}> SubmitWeight</Button>
            </div>

        </div>
    </div>
}
