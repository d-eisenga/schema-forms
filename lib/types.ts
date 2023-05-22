import * as E from '@effect/data/Either';
import {NonEmptyReadonlyArray} from '@effect/data/ReadonlyArray';
import {ParseErrors} from '@effect/schema/ParseResult';

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

export type ErrorFreeFormData = (
  Readonly<Record<string, E.Right<ErrorValue<unknown>, ValidValue<unknown, unknown>>>>
);
