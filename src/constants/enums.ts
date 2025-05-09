// src/constants/enums.ts

export enum Audience {
    Friends = 0,
    Following = 1,
    All = 2
}

export enum SortType {
    New = 0,
    Controversial = 1,
    Hot = 2,
    Top = 3
}

export enum PostType {
    Text = 0,
    Image = 1,
    Wall = 2,
    Burn = 3,  // Adding this based on your MAUI code
    Reply = 4  // Adding this based on your MAUI code
}


export enum ReplyType {
    Non = 0,
    Quote = 1,
    Reply = 2
}

export enum MessageType {
    Text = 0,
    Image = 1,
    Voice = 2
}

export enum ReportedContent {
    User = 0,
    Wall = 1,
    Comment = 2
}

// Add any other enums from your backend as needed