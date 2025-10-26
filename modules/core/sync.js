class SyncService {
    constructor() {
        this.isOnline = false;
        this.checkNetworkStatus();
    }

    async checkNetworkStatus() {
        const networkState = await Network.getNetworkStateAsync();
        this.isOnline = networkState.isConnected && networkState.isInternetReachable;
    }

    async queueForSync(tableName, recordId, operation, data) {
        const syncRecord = {
            table_name: tableName,
            record_id: recordId,
            operation: operation,
            data: JSON.stringify(data),
            created_at: new Date().toISOString()
        };

        await database.executeQuery(
            `INSERT INTO sync_queue (id, table_name, record_id, operation, data) VALUES (?, ?, ?, ?, ?)`,
            [uuid.v4(), ...Object.values(syncRecord)]
        );
    }

    async processSyncQueue() {
        if (!this.isOnline) return;

        const pendingItems = await database.executeQuery(
            'SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 50'
        );

        for (const item of pendingItems.rows._array) {
            try {
                await this.syncItem(item);
                await database.executeQuery('DELETE FROM sync_queue WHERE id = ?', [item.id]);
            } catch (error) {
                console.error('Sync failed for item:', item.id, error);
                await this.handleSyncError(item);
            }
        }
    }
}

export default new SyncService();