/// <reference types="react" />
import * as O from '@effect/data/Option';
import { FormData, FormValue, ErrorList } from './types';
export type SchemaFormContext = {
    data: FormData;
    decoded: O.Option<unknown>;
    formErrors: O.Option<ErrorList>;
    setFieldValue: (fieldName: string, value: FormValue<unknown, unknown>) => void;
    initialValues: Record<string, unknown>;
};
export declare const SchemaFormContext: import("react").Context<SchemaFormContext>;
