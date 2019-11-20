import React from "react";
import Modal from "react-modal";
import styled from "styled-components";

import Button from "../buttons/Button";
import { ClientDetailsItem } from "../ClientItem";
import { BodyText, H4 } from "../Text";

import copy from "../../copy";
import { Schema } from "src/types/oAuthClient";

const Actions = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  & > *:first-child {
    margin-right: 1rem;
  }

  @media (max-width: 800px) {
    flex-direction: column;
    margin-top: 1rem;

    & > *:first-child {
      margin-right: 0;
      margin-bottom: 0.5rem;
    }
  }
`;

type Props = {
  isOpen: boolean;
  closeModal: () => void;
  deleteClient: () => void;
  client: Schema.Client;
  isLoading?: boolean;
};

const modalStyles = {
  overlay: {
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)"
  },
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "420px",
    maxWidth: "calc(100% - 4rem)",
    border: "none"
  }
};

const ClientDeletionConfirmation = ({
  isOpen,
  closeModal,
  deleteClient,
  client,
  isLoading
}: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Confirm client deletion"
      style={modalStyles}
    >
      <H4 className="align-center">{copy.clientDeletion.title}</H4>
      <BodyText className="italic align-center">
        {copy.clientDeletion.subtitle}
      </BodyText>
      <ClientDetailsItem
        name={copy.dashboard.clientDetails.id}
        value={client.id}
      />
      <ClientDetailsItem
        name={copy.dashboard.clientDetails.name}
        value={client.name}
      />
      <Actions>
        <Button onClick={deleteClient} loading={isLoading} destructive>
          {copy.clientDeletion.confirm}
        </Button>
        <Button onClick={closeModal}>{copy.clientDeletion.cancel}</Button>
      </Actions>
    </Modal>
  );
};

export default ClientDeletionConfirmation;
