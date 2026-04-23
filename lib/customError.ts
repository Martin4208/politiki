export type APIErrorObject = {
  name: string;
  message: string;
  title: string; // Frontend で表示するエラータイトル
  description: string; // Frontend で表示するエラー詳細
};

export class APIError extends Error {
  title: string;
  description: string;
  errorCode?: string;
  detail?: string;

  constructor(props: APIErrorObject) {
    super(props.message);
    this.name = props.name;
    this.title = props.title;
    this.description = props.description;
  }
}

export class NotFoundError extends APIError {
  constructor(props: APIErrorObject) {
    super(props);
    this.name = 'NotFoundError';
  }
}
