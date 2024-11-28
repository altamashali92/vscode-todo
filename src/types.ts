export interface QuarantinedTest {
    test_uuid: string;
    name: string;
    path: string;
    type: string;
    branch: string;
    reason: string;
    detected_in_build: string;
    failed_in_build: string;
    subject: string;
    quarantined_by: string;
    quarantine_start: string;
  }

export type FlakyTestMap = Map<string, {
    test_uuid: string;
    type: string;
    test_path: string[];
}[]>