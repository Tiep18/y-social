export enum TokenType {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  EMAIL_VERIFY_TOKEN,
  FORGOT_PASSWORD_TOKEN
}

export enum UserVerifyStatus {
  Unverified,
  Verified,
  Banned
}

export enum MediaType {
  IMAGE,
  VIDEO
}

export enum TweetAudience {
  EVERYONE,
  TweeterCircle
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
