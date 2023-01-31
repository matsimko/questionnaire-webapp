import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { yupErrorToFieldErrors } from "../validation";

export const DEFAULT_TIMEOUT = 600;

export const useGenericController = (
  source,
  id,
  validationSchema = null,
  timeout = DEFAULT_TIMEOUT
) => {
  const [data, setData] = useState(() => {
    return { ...source.get(id), error: {} };
  });
  const pendingData = useRef(null);
  const shouldSourceUpdate = useRef(false);
  const updateTimeoutId = useRef(null);

  const updateData = (updatedData) => {
    setData((data) => {
      return { ...data, ...updatedData };
    });
  };

  const update = (updatedData) => {
    updatedData = { ...pendingData.current, ...updatedData };
    pendingData.current = updatedData;

    if (validationSchema) {
      try {
        validationSchema.validateSync(
          {
            ...data, //passing the rest of the data so that required fields don't have to be in updatedData
            ...updatedData,
          },
          { abortEarly: false }
        );
        shouldSourceUpdate.current = true;
        updateData(updatedData);
      } catch (error) {
        const errors = yupErrorToFieldErrors(error);
        console.log(errors);
        shouldSourceUpdate.current = false;
        updateData({ ...updatedData, error: errors });
      }
    }
  };

  const cancelUpdate = () => {
    if (updateTimeoutId.current) {
      clearTimeout(updateTimeoutId.current);
      updateTimeoutId.current = null;
    }
  };

  useEffect(() => {
    if (!shouldSourceUpdate.current || !pendingData.current) {
      return;
    }

    let isCancelled = false;
    // console.log(pendingData.current);

    new Promise((resolve) => {
      updateTimeoutId.current = setTimeout(() => {
        resolve();
      }, timeout);
    }).then(() => {
      updateTimeoutId.current = null;
      return source
        .update(id, pendingData.current)
        .then((data) => {
          if (!isCancelled) {
            shouldSourceUpdate.current = false;
            updateData({ ...data, error: {} });
            pendingData.current = null;
          }
        })
        .catch((error) => {
          if (!isCancelled) {
            shouldSourceUpdate.current = false;
            updateData({ error });
            //keep the pendingData on Error
          }
        });
    });

    //cancel update on "rerender/unmount"
    return () => {
      isCancelled = true;
      cancelUpdate();
    };
  });

  const destroy = () => {
    return source.delete(id).catch((error) => {
      updateData({ error });
    });
  };

  return useMemo(() => {
    return { data, update, destroy, cancelUpdate, updateData };
  }, [data]); //the id never changes so the functions don't have to be in deps
};
