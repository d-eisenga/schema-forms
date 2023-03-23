import {pipe} from '@effect/data/Function';
import {isSome} from '@effect/data/Option';
import * as S from '@effect/schema/Schema';
import {formatErrors} from '@effect/schema/TreeFormatter';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {FormDebug} from '../lib/FormDebug';
import {SchemaField} from '../lib/SchemaField';
import {SchemaForm} from '../lib/SchemaForm';

const Name = pipe(
  S.string,
  S.message(() => 'Not a string'),
  S.minLength(1),
  S.message(() => 'required'),
  S.maxLength(30),
  S.pattern(/^[a-zA-Z \-.]+$/u),
  S.trimmed()
);

const Age = pipe(S.number, S.nonNegative(), S.finite());

const User = S.struct({
  name: Name,
  age: Age,
});

const TestForm = () => (
  <SchemaForm
    Schema={User}
    onSubmit={console.log}
    render={({errors}) => (
      <>
        <SchemaField
          name="name"
          Schema={Name}
          render={({value, onChange}) => (
            <input
              value={isSome(value) ? value.value : ''}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />
        <SchemaField
          name="age"
          Schema={S.numberFromString(S.string)}
          render={({value, onChange}) => (
            <input
              value={isSome(value) ? value.value : ''}
              onChange={e => onChange(e.target.value)}
            />
          )}
        />
        <input type="submit" disabled={isSome(errors)} />
        {isSome(errors) && (
          <ul>
            {errors.value.map(e => {
              const err = formatErrors([e]);
              return <li key={err}>{err}</li>;
            })}
          </ul>
        )}
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
