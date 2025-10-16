import { notificationManager } from '../utils/notification-manager';

export async function initializeNotifications() {
  try {
    // تهيئة مدير الإشعارات
    await notificationManager.initialize();

    // طلب أذونات الإشعارات
    const granted = await notificationManager.requestPermissions();
    
    if (granted) {
      console.log('تم منح أذونات الإشعارات بنجاح');
      
      // مثال: جدولة إشعار للتذكير بالصلاة
      await notificationManager.scheduleLocalNotification({
        notifications: [{
          id: 1,
          title: 'تذكير بالصلاة',
          body: 'حان الآن موعد صلاة الظهر',
          schedule: {
            on: {
              hour: 12,
              minute: 0
            },
            repeats: true
          },
          sound: 'prayer.wav',
          attachments: undefined,
          actionTypeId: '',
          extra: null
        }]
      });
    } else {
      console.log('لم يتم منح أذونات الإشعارات');
    }
  } catch (error) {
    console.error('حدث خطأ في تهيئة الإشعارات:', error);
  }
}

// استدعاء هذه الدالة عند بدء التطبيق
initializeNotifications();