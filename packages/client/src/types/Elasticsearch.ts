export type SearchResponse<T, A = any> = {
    took: number;
    timed_out: boolean;
    _scroll_id?: string;
    _shards: ShardsResponse;
    hits: {
        total: number;
        max_score: number;
        hits: Array<{
            _index: string;
            _type: string;
            _id: string;
            _score: number;
            _source: T;
            _version?: number;
            _explanation?: Explanation;
            fields?: any;
            highlight?: any;
            inner_hits?: any;
            matched_queries?: string[];
            sort?: string[];
        }>;
    };
    aggregations?: A;
};

export type Aggregations = {
    [key: string]: {
        doc_count_error_upper_bound: number;
        sum_other_doc_count: number;
        buckets: Bucket[];
    }
};

export type Bucket = {
    key: string;
    doc_count: number;
};

type ShardsResponse = {
    total: number;
    successful: number;
    failed: number;
    skipped: number;
};

type Explanation = {
    value: number;
    description: string;
    details: Explanation[];
};
