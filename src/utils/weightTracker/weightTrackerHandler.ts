import type {GitHubRepo, GitHubRepoInfo} from "@/utils/github/githubHandler.ts";

const localStorageWeightTrackerDataRepoInfoKey = "WeightTrackerDataRepoInfo"
const weightDataFilePath = "app/dataStorage/weightRegistrations.json"
export type WeightData = {
    weight: number,
    unit: string,
    date: string,
    time: string,
}

export function GetWeightTrackerRepoInfo(): GitHubRepoInfo | null {
    const localStorageInfo = localStorage.getItem(localStorageWeightTrackerDataRepoInfoKey)
    if (!localStorageInfo) return null;
    const [owner, repo] = localStorageInfo.split(":owner:repo:")
    return {owner, repo}
}

export function StoreWeightTrackerRepoInfo(githubRepoInfo: GitHubRepoInfo) {
    localStorage.setItem(localStorageWeightTrackerDataRepoInfoKey, `${githubRepoInfo.owner}:owner:repo:${githubRepoInfo.repo}`);
}

export function DeleteWeightTrackerRepoInfo() {
    localStorage.removeItem(localStorageWeightTrackerDataRepoInfoKey);
}


export class WeightTrackerHandler {
    private GitHubRepo: GitHubRepo;
    private readonly _mainBranch = "main";

    constructor(gitHubRepo: GitHubRepo) {
        this.GitHubRepo = gitHubRepo;
    }
    public ReInjectGithubRepo(githubRepo: GitHubRepo) {
        this.GitHubRepo = githubRepo;
        return this;
    }

    public async GetWeightData(): Promise<WeightData[]> {
        const fileData = await this.GitHubRepo.GetFileContentNoPathPrefix(weightDataFilePath, this._mainBranch)
        if (!fileData) return [];
        return JSON.parse(fileData) as WeightData[];
    }

    public ConvertStringDateToDate(date: string): Date {
        return new Date(date.split(".").reverse().join("."))
    }

    public async AddWeightData(inp: WeightData) {
        const existingWeightData = await this.GetWeightData()

        const newDate = this.ConvertStringDateToDate(inp.date)
        let dataIsAdded = false;
        for (let i = 0; i < existingWeightData.length; i++) {
            const existingDate = this.ConvertStringDateToDate(existingWeightData[i].date);
            const nextExistingDate = i + 1 == existingWeightData.length ? null : this.ConvertStringDateToDate(existingWeightData[i + 1].date);
            if (nextExistingDate == null) {
                break;
            }
            if (newDate >= existingDate && newDate < nextExistingDate) {
                existingWeightData.splice(i + 1, 0, {
                    weight: inp.weight,
                    date: inp.date,
                    unit: inp.unit,
                    time: inp.time
                });
                dataIsAdded = true;
                break;
            }
        }
        if (!dataIsAdded) {
            existingWeightData.push({
                weight: inp.weight,
                date: inp.date,
                unit: inp.unit,
                time: inp.time
            });
        }
        existingWeightData.sort((a, b) => this.ConvertStringDateToDate(a.date).getTime() - this.ConvertStringDateToDate(b.date).getTime())

        await this.GitHubRepo.CreateOrUpdateFilesNoPathPrefix(this._mainBranch,
            [
                {
                    path: weightDataFilePath,
                    content:JSON.stringify(existingWeightData,null,2)
                }
            ], "Weight data added from SimonEngineer.Github page")
    }
}
