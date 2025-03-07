import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';
import { MouseEvent, useCallback } from 'react';
import { IconPlus, MenuItem } from 'twenty-ui';

import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { prefetchViewsFromObjectMetadataItemFamilySelector } from '@/prefetch/states/selector/prefetchViewsFromObjectMetadataItemFamilySelector';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useChangeView } from '@/views/hooks/useChangeView';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useUpdateView } from '@/views/hooks/useUpdateView';
import { ViewPickerOptionDropdown } from '@/views/view-picker/components/ViewPickerOptionDropdown';
import { useViewPickerMode } from '@/views/view-picker/hooks/useViewPickerMode';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

const StyledBoldDropdownMenuItemsContainer = styled(DropdownMenuItemsContainer)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ViewPickerListContent = () => {
  const { t } = useLingui();

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const viewsOnCurrentObject = useRecoilValue(
    prefetchViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { currentView } = useGetCurrentViewOnly();

  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );

  const { setViewPickerMode } = useViewPickerMode();

  const { updateView } = useUpdateView();
  const { changeView } = useChangeView();

  const handleViewSelect = (viewId: string) => {
    changeView(viewId);
  };

  const handleAddViewButtonClick = () => {
    if (isDefined(currentView?.id)) {
      setViewPickerReferenceViewId(currentView.id);
      setViewPickerMode('create-empty');
    }
  };

  const handleEditViewButtonClick = (
    event: MouseEvent<HTMLElement>,
    viewId: string,
  ) => {
    event.stopPropagation();
    setViewPickerReferenceViewId(viewId);
    setViewPickerMode('edit');
  };

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      moveArrayItem(viewsOnCurrentObject, {
        fromIndex: result.source.index,
        toIndex: result.destination.index,
      }).forEach((view, index) => {
        if (view.position !== index) {
          updateView({ ...view, position: index });
        }
      });
    },
    [updateView, viewsOnCurrentObject],
  );

  return (
    <>
      <DropdownMenuItemsContainer>
        <DraggableList
          onDragEnd={handleDragEnd}
          draggableItems={viewsOnCurrentObject.map((view, index) => {
            const isIndexView = view.key === 'INDEX';
            return (
              <DraggableItem
                key={view.id}
                draggableId={view.id}
                index={index}
                isDragDisabled={viewsOnCurrentObject.length === 1}
                itemComponent={
                  <ViewPickerOptionDropdown
                    view={{ ...view, __typename: 'View' }}
                    handleViewSelect={handleViewSelect}
                    isIndexView={isIndexView}
                    onEdit={handleEditViewButtonClick}
                  />
                }
              />
            );
          })}
        />
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <StyledBoldDropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          onClick={handleAddViewButtonClick}
          LeftIcon={IconPlus}
          text={t`Add view`}
        />
      </StyledBoldDropdownMenuItemsContainer>
    </>
  );
};
