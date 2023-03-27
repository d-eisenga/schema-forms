import * as E from '@effect/data/Either';
import {NonEmptyReadonlyArray} from '@effect/data/ReadonlyArray';
import {ParseErrors} from '@effect/schema/ParseResult';
import * as S from '@effect/schema/Schema';

export type ErrorList = NonEmptyReadonlyArray<ParseErrors>;

export type ValidValue<From, To> = {
  value: To;
  from: From;
};

export type ErrorValue<From> = {
  errors: ErrorList;
  from: From;
};

export type FormValue<From, To> = E.Either<ErrorValue<From>, ValidValue<From, To>>;

export type FormData = Readonly<Record<string, FormValue<unknown, unknown>>>;

export type ErrorFreeFormData = Readonly<Record<string, E.Right<ValidValue<unknown, unknown>>>>;

export type FieldType<Schema, FieldName> = (
  Schema extends S.Schema<infer From, infer To> ? (
    FieldName extends keyof From ? (
      FieldName extends keyof To ? (
        S.Schema<From[FieldName], To[FieldName]>
      ) : never
    ) : never
  ) : never
);

export type FormData2<Schema> = (
  Schema extends S.Schema<infer From, infer To> ? {
    [K in (keyof From & keyof To)]: FormValue<From[K], To[K]>;
  } : never
);
