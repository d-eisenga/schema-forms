import {pipe} from '@effect/data/Function';
import {Option, isSome} from '@effect/data/Option';
import {MessageAnnotation} from '@effect/schema/AST';
import * as S from '@effect/schema/Schema';
import {formatErrors} from '@effect/schema/TreeFormatter';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {FormDebug} from '../lib/FormDebug';
import {SchemaField} from '../lib/SchemaField';
import {SchemaForm} from '../lib/SchemaForm';
import {ErrorList} from '../lib/types';
import {chainSchema} from '../lib/util';

const NonEmptyString = (message: MessageAnnotation<unknown>) => pipe(
  S.string,
  S.message(message),
  S.trimmed(),
  S.nonEmpty({message})
);

const Name = pipe(
  NonEmptyString(() => 'is required'),
  S.maxLength(30, {message: () => 'cannot exceed 30 characters'}),
  S.pattern(/^[a-zA-Z \-.]+$/u, {message: () => 'may only contain letters, spaces, and dashes'})
);

const Age = pipe(
  S.number,
  S.message(() => 'must be a number'),
  S.nonNegative({message: () => 'cannot be negative'}),
  S.finite({message: () => 'must be finite'})
);
const AgeFromString = pipe(
  NonEmptyString(() => 'is required'),
  chainSchema(S.NumberFromString),
  chainSchema(Age)
);

const Errors = ({errors}: {errors: Option<ErrorList>}) => (
  isSome(errors) ? (
    <ul>
      {errors.value.map(e => {
        const err = formatErrors([e]);
        return <li key={err}>{err}</li>;
      })}
    </ul>
  ) : null
);

const User = S.struct({
  name: Name,
  age: Age,
});

const TestForm = () => (
  <SchemaForm
    Schema={User}
    onSubmit={console.log}
    initialValues={{
      name: '123',
      age: 'abc',
    }}
    render={({errors}) => (
      <>
        <SchemaField
          name="name"
          Schema={Name}
          render={({value, onChange, fieldErrors}) => (
            <>
              <input
                value={isSome(value) ? value.value : ''}
                onChange={e => onChange(e.target.value)}
              />
              <Errors errors={fieldErrors} />
            </>
          )}
        />
        <SchemaField
          name="age"
          Schema={AgeFromString}
          render={({value, onChange, fieldErrors}) => (
            <>
              <input
                value={isSome(value) ? value.value : ''}
                onChange={e => onChange(e.target.value)}
              />
              <Errors errors={fieldErrors} />
            </>
          )}
        />
        <input type="submit" disabled={isSome(errors)} />
        <Errors errors={errors} />
        <FormDebug />
      </>
    )}
  />
);

const container = document.getElementById('app');
if (container !== null) {
  const root = createRoot(container);
  root.render(<TestForm />);
}
