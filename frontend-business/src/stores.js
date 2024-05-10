import { create } from 'zustand';

const useAuthStore = create((set) => ({
    email: '',
    login: (email) => set({
        email: email,
    }),
    logoff: () => set({ 
        email: '',
    }),
}));

const usePipelineStore = create((set) => ({
    model_name: '',
    model_version: '',
    stored_tablename: '',
    input_threshold: '',
    setModelName: (model_name) => set({ model_name: model_name }),
    setModelVersion: (model_version) => set({ model_version: model_version }),
    setStoredTablename: (stored_tablename) => set({ stored_tablename: stored_tablename }),
    setInputThreshold: (input_threshold) => set({ input_threshold: input_threshold }),

}));

const useAnomalyStore = create((set) => ({
    anomalyLogId: '',
    setAnomalyLogId: (anomalyLogId) => set({ anomalyLogId: anomalyLogId }),
    anomalyLogResults: {},
    setAnomalyLogResults: (anomalyLogResults) => set({ anomalyLogResults: anomalyLogResults }),
    fullDataSet: [],
    setFullDataSet: (fullDataSet) => set({ fullDataSet: fullDataSet }),
    anomalyIds: [],
    setAnomaliesIds: (anomalyIds) => set({ anomalyIds: anomalyIds }),
    anomalies: [],
    setAnomalies: (anomalies) => set({ anomalies: anomalies }),
    rejectedAnomalies: [],
    setRejectedAnomalies: (rejectedAnomalies) => set({ rejectedAnomalies: rejectedAnomalies }),
}));

export { useAuthStore , usePipelineStore, useAnomalyStore };