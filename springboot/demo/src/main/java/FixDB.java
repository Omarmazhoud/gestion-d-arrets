import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class FixDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/pfe";
        String user = "omar";
        String password = "omar";

        try (Connection conn = DriverManager.getConnection(url, user, password);
             Statement stmt = conn.createStatement()) {
            
            System.out.println("Dropping constraints...");
            stmt.executeUpdate("ALTER TABLE machine DROP CONSTRAINT IF EXISTS machine_secteur_check;");
            stmt.executeUpdate("ALTER TABLE ticket_panne DROP CONSTRAINT IF EXISTS ticket_panne_secteur_type_check;");
            
            System.out.println("Adding missing columns...");
            stmt.executeUpdate("ALTER TABLE utilisateur ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT FALSE;");
            stmt.executeUpdate("ALTER TABLE ticket_panne ADD COLUMN IF NOT EXISTS date_fermeture TIMESTAMP;");

            System.out.println("Cleaning online statuses...");
            stmt.executeUpdate("UPDATE utilisateur SET is_online = FALSE;");

            System.out.println("SUCCESS: DB Synced & Status Reset.");
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
