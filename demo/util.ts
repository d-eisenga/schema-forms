import {identity} from '@effect/data/Function';
import * as S from '@effect/schema/Schema';

export const chainSchema = <Intermediate, To>(self: S.Schema<Intermediate, To>) => (
  <From>(other: S.Schema<From, Intermediate>) => S.transform<From, Intermediate, Intermediate, To>(
    other,
    self,
    identity,
    identity
  )
);
