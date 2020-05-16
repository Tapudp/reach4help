import { Request, RequestStatus } from 'src/models/requests';
import createReducer from 'src/store/utils/createReducer';

import {
  CHANGE_MODAL,
  OBSERVE_ACCEPTED_REQUESTS,
  OBSERVE_CANCELLED_REQUESTS,
  OBSERVE_CLOSED_REQUESTS,
  OBSERVE_COMPLETED_REQUESTS,
  OBSERVE_FINISHED_REQUESTS,
  OBSERVE_ONGOING_REQUESTS,
  OBSERVE_OPEN_REQUESTS,
  RequestState,
  SET,
} from './types';

const initialSetActionState = {
  loading: false,
  success: false,
  error: undefined,
  modalState: false,
};

const initialRequestsState = {
  loading: false,
  observerReceivedFirstUpdate: false,
  data: undefined,
  error: undefined,
};

const initialState: RequestState = {
  openRequests: initialRequestsState,
  ongoingRequests: initialRequestsState,
  acceptedRequests: initialRequestsState,
  completedRequests: initialRequestsState,
  finishedRequests: initialRequestsState,
  cancelledRequests: initialRequestsState,
  closedRequests: initialRequestsState,
  setAction: initialSetActionState,
};

const requestStatusMapper = {
  [RequestStatus.pending]: 'openRequests',
  [RequestStatus.ongoing]: 'ongoingRequests',
  [RequestStatus.accepted]: 'acceptedRequests',
  [RequestStatus.completed]: 'completedRequests',
  [RequestStatus.finished]: 'finishedRequests',
  [RequestStatus.cancelled]: 'cancelledRequests',
  [RequestStatus.closed]: 'closedRequests',
};
const updateRequestState = (state: RequestState, payload) => {
  state[
    requestStatusMapper[payload.requestStatus]
  ].data = payload.snap.docs.reduce(
    (acc, doc) => ({
      ...acc,
      [doc.id]: doc.data(),
    }),
    {},
  );
  state[requestStatusMapper[payload.requestStatus]].loading = false;
  state[
    requestStatusMapper[payload.requestStatus]
  ].observerReceivedFirstUpdate = true;
};

export default createReducer<RequestState>(
  {
    [SET.PENDING]: (state: RequestState) => {
      state.setAction.loading = true;
      state.setAction.error = undefined;
    },
    [SET.COMPLETED]: (state: RequestState) => {
      state.setAction.error = undefined;
      state.setAction.loading = false;
      state.setAction.success = true;
    },
    [SET.REJECTED]: (state: RequestState, { payload }: { payload: Error }) => {
      state.setAction.loading = false;
      state.setAction.error = payload;
      state.setAction.success = false;
    },
    [CHANGE_MODAL]: (
      state: RequestState,
      { payload }: { payload: boolean },
    ) => {
      state.setAction.modalState = payload;
      if (!payload) {
        state.setAction.success = false;
      }
    },
    [OBSERVE_OPEN_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.openRequests.loading = true;
    },
    [OBSERVE_OPEN_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: firebase.firestore.QuerySnapshot<Request>;
      },
    ) => {
      state.openRequests.data = payload.docs.reduce(
        (acc, doc) => ({
          ...acc,
          [doc.id]: doc.data(),
        }),
        {},
      );
      state.openRequests.loading = false;
      state.openRequests.observerReceivedFirstUpdate = true;
    },
    [OBSERVE_OPEN_REQUESTS.ERROR]: (
      state: RequestState,
      { payload }: { payload: Error },
    ) => {
      state.openRequests.error = payload;
      state.openRequests.loading = false;
    },
    [OBSERVE_ONGOING_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.openRequests.loading = true;
    },
    [OBSERVE_ONGOING_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
    [OBSERVE_ACCEPTED_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.acceptedRequests.loading = true;
    },
    [OBSERVE_ACCEPTED_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
    [OBSERVE_COMPLETED_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.completedRequests.loading = true;
    },
    [OBSERVE_COMPLETED_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
    [OBSERVE_FINISHED_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.finishedRequests.loading = true;
    },
    [OBSERVE_FINISHED_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
    [OBSERVE_CANCELLED_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.cancelledRequests.loading = true;
    },
    [OBSERVE_CANCELLED_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
    [OBSERVE_CLOSED_REQUESTS.SUBSCRIBE]: (state: RequestState) => {
      state.closedRequests.loading = true;
    },
    [OBSERVE_CLOSED_REQUESTS.UPDATED]: (
      state: RequestState,
      {
        payload,
      }: {
        payload: {
          requestStatus: RequestStatus;
          snap: firebase.firestore.QuerySnapshot<Request>;
        };
      },
    ) => updateRequestState(state, payload),
  },
  initialState,
);
