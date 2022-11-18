import { useMemo } from 'react';
import get from 'lodash/get';
// import { useCMEditViewDataManager } from '@strapi/helper-plugin'; // CUSTOM MOD [1].
import { useMenuData } from '../../../hooks'; // CUSTOM MOD [1].

// import { getRequestUrl } from '../../../utils'; // CUSTOM MOD [3].

function useSelect({
  componentUid,
  isUserAllowedToEditField,
  isUserAllowedToReadField,
  name,
  queryInfos,
}) {
  // const {
  //   isCreatingEntry,
  //   createActionAllowedFields,
  //   readActionAllowedFields,
  //   updateActionAllowedFields,
  //   slug,
  //   initialData,
  // } = useCMEditViewDataManager(); // CUSTOM MOD [1].
  const { isCreatingEntry, initialData } = useMenuData(); // CUSTOM MOD [1].
  const createActionAllowedFields = true; // CUSTOM MOD [7].
  const readActionAllowedFields = true; // CUSTOM MOD [7].
  const updateActionAllowedFields = true; // CUSTOM MOD [7].
  const slug = 'plugin::menus.menu-item'; // CUSTOM MOD [8].

  const isFieldAllowed = useMemo(() => {
    if (isUserAllowedToEditField === true) {
      return true;
    }

    const allowedFields = isCreatingEntry ? createActionAllowedFields : updateActionAllowedFields;

    return allowedFields.includes(name);
  }, [
    isCreatingEntry,
    createActionAllowedFields,
    name,
    isUserAllowedToEditField,
    updateActionAllowedFields,
  ]);

  const isFieldReadable = useMemo(() => {
    if (isUserAllowedToReadField) {
      return true;
    }

    const allowedFields = isCreatingEntry ? [] : readActionAllowedFields;

    return allowedFields.includes(name);
  }, [isCreatingEntry, isUserAllowedToReadField, name, readActionAllowedFields]);

  const fieldNameKeys = name.split('.');
  let componentId;

  if (componentUid) {
    componentId = get(initialData, fieldNameKeys.slice(0, -1))?.id;
  }

  // /content-manager/relations/[model]/[id]/[field-name]
  const relationFetchEndpoint = useMemo(() => {
    if (isCreatingEntry) {
      return null;
    }

    if (componentUid) {
      // repeatable components and dz are dynamically created
      // if no componentId exists in initialData it means that the user just created it
      // there then are no relations to request
      return componentId
        // ? getRequestUrl(`relations/${componentUid}/${componentId}/${fieldNameKeys.at(-1)}`) // CUSTOM MOD [3].
        ? `/content-manager/relations/${componentUid}/${componentId}/${fieldNameKeys.at(-1)}` // CUSTOM MOD [3].
        : null;
    }

    // return getRequestUrl(`relations/${slug}/${initialData.id}/${name.split('.').at(-1)}`); // CUSTOM MOD [3].
    return `/content-manager/relations/${slug}/${initialData.id}/${name.split('.').at(-1)}`; // CUSTOM MOD [3].
  }, [isCreatingEntry, componentUid, slug, initialData.id, name, componentId, fieldNameKeys]);

  // /content-manager/relations/[model]/[field-name]
  const relationSearchEndpoint = useMemo(() => {
    if (componentUid) {
      // return getRequestUrl(`relations/${componentUid}/${name.split('.').at(-1)}`); // CUSTOM MOD [3].
      return `/content-manager/relations/${componentUid}/${name.split('.').at(-1)}`; // CUSTOM MOD [3].
    }

    // return getRequestUrl(`relations/${slug}/${name.split('.').at(-1)}`); // CUSTOM MOD [3].
    return `/content-manager/relations/${slug}/${name.split('.').at(-1)}`; // CUSTOM MOD [3].
  }, [componentUid, slug, name]);

  return {
    componentId,
    isComponentRelation: Boolean(componentUid),
    queryInfos: {
      ...queryInfos,
      endpoints: {
        search: relationSearchEndpoint,
        relation: relationFetchEndpoint,
      },
    },
    isCreatingEntry,
    isFieldAllowed,
    isFieldReadable,
  };
}

export default useSelect;
