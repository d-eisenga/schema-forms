import * as E from '@effect/data/Either';
import {pipe} from '@effect/data/Function';
import * as O from '@effect/data/Option';
import {FormValue, ParseErrors} from './types';

export const validValue = <From, To>(
  from: From,
  value: To
): FormValue<From, To> => E.right({
  value,
  from,
});

export const errorValue = <From, To>(
  from: From,
  errors: ParseErrors
): FormValue<From, To> => E.left({
  errors,
  from,
});

export const foldEither = <E, A, B>(
  onLeft: (e: E) => B,
  onRight: (a: A) => B
) => (self: E.Either<E, A>) => (
  E.isLeft(self) ? onLeft(self.left) : onRight(self.right)
);

export const chainOption = <A, B>(
  fn: (a: A) => O.Option<B>
) => (self: O.Option<A>) => (
  O.isSome(self) ? fn(self.value) : self
);

export const getRawValue = <From, To>(value: FormValue<From, To>) => pipe(
  value,
  foldEither(
    e => e.from,
    v => v.from
  )
);

export const getDecodedValue = <From, To>(value: FormValue<From, To>) => pipe(
  value,
  E.toOption,
  O.map(v => v.value)
);
