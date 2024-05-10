import * as React from 'react';
import { useState } from 'react';

import {
  Table,
  Header,
  HeaderRow,
  Body,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table';
import {
    useSort,
    HeaderCellSort,
    SortIconPositions,
    SortToggleType,
  } from "@table-library/react-table-library/sort";
  
import { useTheme } from '@table-library/react-table-library/theme';
import { getTheme } from '@table-library/react-table-library/baseline';
import { Button, Form } from 'react-bootstrap';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useAuthStore, useAnomalyStore, usePipelineStore } from "../stores";

const AnomalyTable = () => {
    const anomalies = useAnomalyStore((state) => state.anomalies);
    const data = { nodes: anomalies };
    const theme = getTheme(useTheme());

    const rejectedAnomalies = useAnomalyStore((state) => state.rejectedAnomalies);
    const setRejectedAnomalies = useAnomalyStore((state) => state.setRejectedAnomalies);
    const setAnomalies = useAnomalyStore((state) => state.setAnomalies);

    const [rejectedIds, setRejectedIds] = useState([]);

    const handleRejectButtonClick = (e, anomalyId) => {
      if (e.target.checked === true) {
        if (!rejectedAnomalies.includes(anomalyId)) {
          const newRejectedIds = [...rejectedAnomalies, anomalyId];
          setRejectedAnomalies(newRejectedIds);
        }
      } else {
        if (rejectedAnomalies.includes(anomalyId)) {
          const newRejectedIds = rejectedAnomalies.filter((id) => id !== anomalyId);
          setRejectedAnomalies(newRejectedIds);
        }
      }
      console.log(rejectedAnomalies);
    }
    
  return (
    <Table data={data} theme={theme}>
      {(tableList) => (
        <>
          <Header>
            <HeaderRow>
              <HeaderCell>anomaly id</HeaderCell>
              <HeaderCell>bin</HeaderCell>
              <HeaderCell>amt</HeaderCell>
              <HeaderCell>customer id</HeaderCell>
              <HeaderCell>entry mode</HeaderCell>
              <HeaderCell>fraud</HeaderCell>
              <HeaderCell>fraud scenario</HeaderCell>
              <HeaderCell>post_ts</HeaderCell>
              <HeaderCell>terminal id</HeaderCell>
              <HeaderCell>transaction id</HeaderCell>
              <HeaderCell>Reject</HeaderCell>
            </HeaderRow>
          </Header>

          <Body>
            {tableList.map((item, i) => (
              <Row key={i} item={item}>
                <Cell>{item.id}</Cell>
                <Cell>{item.bin}</Cell>
                <Cell>{item.amt}</Cell>
                <Cell>{item.customer_id}</Cell>
                <Cell>{item.entry_mode}</Cell>
                <Cell>{item.fraud}</Cell>
                <Cell>{item.fraud_scenario}</Cell>
                <Cell>{item.post_ts}</Cell>
                <Cell>{item.terminal_id}</Cell>
                <Cell>{item.transaction_id}</Cell>
                <Cell className='d-flex justify-content-center'><Form.Check
                    type={'checkbox'}
                    id={`checkbox-${item.id}`}
                    onChange={(e) => handleRejectButtonClick(e, item.id)}
                  /></Cell>
              </Row>
            ))}
          </Body>
        </>
      )}
    </Table>
  );
};

export { AnomalyTable };
