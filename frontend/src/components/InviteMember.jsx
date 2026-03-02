import { Modal } from "@mantine/core";

export default function InviteMember({ opened, onClose }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Invite Member"
      size="lg"
      centered
      styles={{
        title: {
          fontSize: "1.25rem",
          fontWeight: 600,
        },
      }}
    >
      Invite Member
    </Modal>
  );
}
