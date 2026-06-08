// lib/react-19-patch.ts
import * as React from 'react';

if (typeof window !== 'undefined') {
  // @ts-expect-error 
  if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    // @ts-expect-error
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = {};
  }
  
  // @ts-expect-error
  if (!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig) {
    // @ts-expect-error
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentBatchConfig = {
      transition: null,
    };
  }
}
