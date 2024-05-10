import { create } from 'zustand'

const useAuthStore = create((set) => ({
  loggedInStatus: false,
  loggedInUser: "",
  logout: () => set({ loggedInStatus: false, loggedInUser: "" }),
  login: (email) => set({ loggedInStatus: true, loggedInUser: email}),
}));

const usePipelineStore = create((set) => ({
  targetDataSetName: "",
  targetPipelineName: "",
  pipelineInfo: {},
  setTargetDataSetName: (name) => set({ targetDataSetName: name }),
  setTargetPipelineName: (name) => set({ targetPipelineName: name }),
  setPipelineInfo: (info) => set({ pipelineInfo: info}),
}));


export { useAuthStore, usePipelineStore};