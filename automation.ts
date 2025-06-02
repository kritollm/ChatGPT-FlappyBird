export type Action =
  | { type: 'navigate'; url: string }
  | { type: 'click'; selector: string }
  | { type: 'fill'; selector: string; value: string }
  | {
      type: 'extract';
      container: string;
      fields: { key: string; selector: string }[];
    };

export class Step {
  constructor(public actions: Action[]) {}
  async run(page: MockPage): Promise<void> {
    for (const action of this.actions) {
      await page.execute(action);
    }
  }
}

export class Task {
  constructor(public steps: Step[]) {}
  async run(page: MockPage): Promise<void> {
    for (const step of this.steps) {
      await step.run(page);
    }
  }
}

export class MockPage {
  logs: string[] = [];
  filled: Record<string, string> = {};
  lastExtract: any[] = [];
  constructor(public dom: Record<string, any[]> = {}) {}

  async execute(action: Action): Promise<void> {
    switch (action.type) {
      case 'navigate':
        this.logs.push(`navigate:${action.url}`);
        break;
      case 'click':
        this.logs.push(`click:${action.selector}`);
        break;
      case 'fill':
        this.logs.push(`fill:${action.selector}=${action.value}`);
        this.filled[action.selector] = action.value;
        break;
      case 'extract':
        this.logs.push(`extract:${action.container}`);
        this.lastExtract = this.extract(action.container, action.fields);
        break;
    }
  }

  extract(container: string, fields: { key: string; selector: string }[]): any[] {
    const items = this.dom[container] || [];
    return items.map((item) => {
      const result: Record<string, any> = {};
      for (const f of fields) {
        result[f.key] = item[f.selector];
      }
      return result;
    });
  }
}
