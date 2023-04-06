import * as E from '@effect/data/Either';
import {pipe, identity} from '@effect/data/Function';
import * as O from '@effect/data/Option';
import * as S from '@effect/schema/Schema';
import {FormValue, ErrorList} from './types';

export const validValue = <From, To>(
  from: From,
  value: To
): FormValue<From, To> => E.right({
  value,
  from,
});

export const errorValue = <From, To>(
  from: From,
  errors: ErrorList
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
) => (self: O.Option<A>): O.Option<B> => (
  O.isSome(self) ? fn(self.value) : O.none()
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

export const chainSchema = <Intermediate, To>(self: S.Schema<Intermediate, To>) => (
  <From>(other: S.Schema<From, Intermediate>) => S.transform<From, Intermediate, Intermediate, To>(
    other,
    self,
    identity,
    identity
  )
);
