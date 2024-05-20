-- CreateIndex
CREATE INDEX "client_groups_id_user_id_idx" ON "client_groups"("id", "user_id");

-- CreateIndex
CREATE INDEX "clients_id_client_group_id_idx" ON "clients"("id", "client_group_id");
