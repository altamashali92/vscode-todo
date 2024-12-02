import fs from 'fs/promises';
import { QuarantinedTest } from "../types";

interface QuarantinedTestsResponse {
  success: boolean;
  message: string;
  data: QuarantinedTest[];
}

type ProjectType = 'jira';
type TestType = 'jest-unit';

const SLAUTH_TOKEN = process.env.SLAUTH_TOKEN;
const BASE_URL = 'https://flakinator.us-east-1.prod.atl-paas.net';

const getHeaders = (token: string) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `slauth ${token}`);
    return myHeaders;
}

export const getQuarantinedTests = async (token: string, project: ProjectType, testType: TestType) => {
    if (!token) {
        throw new Error("No token provided");
    }

    const response = await fetch(`${BASE_URL}/api/v1/quarantine/project/${project}/type/${testType}`, {
        method: "GET",
        headers: getHeaders(token),
    });
    const responseData = await response.json() as QuarantinedTestsResponse;

    if (!responseData.success) {
        throw new Error(responseData.message);
    }

    console.log(responseData.data.map(test => test.path).slice(0, 5));

    return responseData.data;
};