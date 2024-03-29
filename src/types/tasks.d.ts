import { ConstructorClientOptions, NetworkParameters } from '.';

export default Tasks;

export interface TasksParameters {
  numResultsPerPage?: number;
  page?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}

declare class Tasks {
  constructor(options: ConstructorClientOptions);

  options: ConstructorClientOptions;

  getAllTasks(
    parameters?: TasksParameters,
    networkParameters?: NetworkParameters
  ): Promise<TasksResponseType>;

  getTask(
    parameters?: {
      id: string;
    },
    networkParameters?: NetworkParameters
  ): Promise<Task>;
}

/* tasks results returned from server */
export interface TasksResponseType {
  total_count: number;
  tasks: Partial<Task>[];
  status_counts: {
    QUEUED: number;
    DONE: number;
    IN_PROGRESS: number;
    FAILED: number;
    CANCELED: number;
  };
}

export type TaskStatus = 'QUEUED' | 'DONE' | 'FAILED' | 'IN_PROGRESS';

export interface Task extends Record<string, any> {
  id: number;
  type: 'ingestion' | 'user_data_request';
  status: TaskStatus;
  submission_time: string;
  last_update: string;
  filename: string;
  protocol: 'ftp' | 'http' | null;
  result?: {
    changelog?: Partial<ChangeLog>;
  };
}

export interface ChangeLog extends Record<string, any> {
  sections?: {
    [key: string]: {
      items_updated: number;
      items_deleted: number;
      variations_updated: number;
      variations_deleted: number;
    };
  };
  index_built: boolean;
}
