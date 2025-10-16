import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';

export class PermissionsManager {
  private static instance: PermissionsManager;
  private permissionsGranted: { [key: string]: boolean } = {};

  private constructor() {}

  public static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }

  async requestNotificationPermissions(): Promise<boolean> {
    try {
      // First, check if notifications are supported
      const canPrompt = await PushNotifications.checkPermissions();
      
      if (canPrompt.receive === 'prompt' || canPrompt.receive === 'prompt-with-rationale') {
        // Show custom dialog explaining why we need notifications
        const userChoice = await this.showPermissionDialog('notifications');
        if (!userChoice) return false;
      }

      // Request push notification permissions
      const result = await PushNotifications.requestPermissions();
      const granted = result.receive === 'granted';
      
      if (granted) {
        // Register with push notification service
        await PushNotifications.register();
        
        // Also request local notification permissions
        await LocalNotifications.requestPermissions();
      }

      this.permissionsGranted['notifications'] = granted;
      return granted;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  private async showPermissionDialog(permissionType: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Here you can implement your custom dialog UI
      // For now, we'll just show a browser confirm
      const message = this.getPermissionMessage(permissionType);
      const result = confirm(message);
      resolve(result);
    });
  }

  private getPermissionMessage(permissionType: string): string {
    const messages = {
      notifications: 'نحتاج إلى إذن الإشعارات لتذكيرك بالتحديات اليومية وإبقائك على اطلاع بآخر المستجدات.',
      // Add more permission types and messages as needed
    };
    return messages[permissionType] || 'نحتاج إلى هذا الإذن لتحسين تجربتك في التطبيق.';
  }

  public async checkPermissionStatus(permissionType: string): Promise<boolean> {
    switch (permissionType) {
      case 'notifications':
        const status = await PushNotifications.checkPermissions();
        return status.receive === 'granted';
      default:
        return false;
    }
  }

  public isPermissionGranted(permissionType: string): boolean {
    return this.permissionsGranted[permissionType] || false;
  }
}

// Export singleton instance
export const permissionsManager = PermissionsManager.getInstance();