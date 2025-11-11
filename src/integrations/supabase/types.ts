export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      honor_tarif: {
        Row: {
          created_at: string | null
          id: string
          jenis_kegiatan: string
          keterangan: string | null
          nama_jabatan: string | null
          potongan_pajak_persen: number
          tarif_bruto: number
          tarif_netto: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jenis_kegiatan: string
          keterangan?: string | null
          nama_jabatan?: string | null
          potongan_pajak_persen?: number
          tarif_bruto: number
          tarif_netto?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jenis_kegiatan?: string
          keterangan?: string | null
          nama_jabatan?: string | null
          potongan_pajak_persen?: number
          tarif_bruto?: number
          tarif_netto?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jurusan: {
        Row: {
          created_at: string | null
          id: string
          keterangan: string | null
          kode_jurusan: string
          nama_jurusan: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          keterangan?: string | null
          kode_jurusan: string
          nama_jurusan: string
        }
        Update: {
          created_at?: string | null
          id?: string
          keterangan?: string | null
          kode_jurusan?: string
          nama_jurusan?: string
        }
        Relationships: []
      }
      kegiatan: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          id_honor_tarif: string | null
          id_jurusan: string | null
          jenis_kegiatan: string
          nama_kegiatan: string
          status_validasi:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          id_honor_tarif?: string | null
          id_jurusan?: string | null
          jenis_kegiatan: string
          nama_kegiatan: string
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          id_honor_tarif?: string | null
          id_jurusan?: string | null
          jenis_kegiatan?: string
          nama_kegiatan?: string
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kegiatan_id_honor_tarif_fkey"
            columns: ["id_honor_tarif"]
            isOneToOne: false
            referencedRelation: "honor_tarif"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kegiatan_id_jurusan_fkey"
            columns: ["id_jurusan"]
            isOneToOne: false
            referencedRelation: "jurusan"
            referencedColumns: ["id"]
          },
        ]
      }
      pegawai: {
        Row: {
          created_at: string | null
          golongan: string
          id: string
          id_jurusan: string | null
          jabatan: string
          nama: string
          nip: string
          nomor_rekening: string
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          golongan: string
          id?: string
          id_jurusan?: string | null
          jabatan: string
          nama: string
          nip: string
          nomor_rekening: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          golongan?: string
          id?: string
          id_jurusan?: string | null
          jabatan?: string
          nama?: string
          nip?: string
          nomor_rekening?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pegawai_id_jurusan_fkey"
            columns: ["id_jurusan"]
            isOneToOne: false
            referencedRelation: "jurusan"
            referencedColumns: ["id"]
          },
        ]
      }
      pembayaran: {
        Row: {
          bruto: number
          created_at: string | null
          id: string
          id_kegiatan: string
          id_pegawai: string
          netto: number | null
          pajak: number
          status_validasi:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal_pembayaran: string | null
          updated_at: string | null
          validated_by_jurusan: string | null
          validated_by_kepegawaian: string | null
          validated_by_keuangan: string | null
        }
        Insert: {
          bruto: number
          created_at?: string | null
          id?: string
          id_kegiatan: string
          id_pegawai: string
          netto?: number | null
          pajak: number
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal_pembayaran?: string | null
          updated_at?: string | null
          validated_by_jurusan?: string | null
          validated_by_kepegawaian?: string | null
          validated_by_keuangan?: string | null
        }
        Update: {
          bruto?: number
          created_at?: string | null
          id?: string
          id_kegiatan?: string
          id_pegawai?: string
          netto?: number | null
          pajak?: number
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tanggal_pembayaran?: string | null
          updated_at?: string | null
          validated_by_jurusan?: string | null
          validated_by_kepegawaian?: string | null
          validated_by_keuangan?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pembayaran_id_kegiatan_fkey"
            columns: ["id_kegiatan"]
            isOneToOne: false
            referencedRelation: "kegiatan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pembayaran_id_pegawai_fkey"
            columns: ["id_pegawai"]
            isOneToOne: false
            referencedRelation: "pegawai"
            referencedColumns: ["id"]
          },
        ]
      }
      perhitungan_insentif: {
        Row: {
          created_at: string | null
          created_by: string | null
          golongan: string
          id: string
          id_pegawai: string
          jabatan_kepanitiaan: string
          jumlah_hari: number
          pendapatan_netto: number
          pph_pasal_21: number
          status_validasi:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tarif_bruto: number
          total_insentif: number
          updated_at: string | null
          validated_by_jurusan: string | null
          validated_by_kepegawaian: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          golongan: string
          id?: string
          id_pegawai: string
          jabatan_kepanitiaan: string
          jumlah_hari?: number
          pendapatan_netto: number
          pph_pasal_21?: number
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tarif_bruto: number
          total_insentif: number
          updated_at?: string | null
          validated_by_jurusan?: string | null
          validated_by_kepegawaian?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          golongan?: string
          id?: string
          id_pegawai?: string
          jabatan_kepanitiaan?: string
          jumlah_hari?: number
          pendapatan_netto?: number
          pph_pasal_21?: number
          status_validasi?:
            | Database["public"]["Enums"]["validation_status"]
            | null
          tarif_bruto?: number
          total_insentif?: number
          updated_at?: string | null
          validated_by_jurusan?: string | null
          validated_by_kepegawaian?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perhitungan_insentif_id_pegawai_fkey"
            columns: ["id_pegawai"]
            isOneToOne: false
            referencedRelation: "pegawai"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          nama: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          id: string
          nama: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          id?: string
          nama?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_jurusan: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_kepegawaian"
        | "admin_jurusan"
        | "admin_keuangan"
      status_type: "aktif" | "nonaktif"
      validation_status:
        | "pending"
        | "validated_keuangan"
        | "validated_kepegawaian"
        | "validated_jurusan"
        | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin_kepegawaian",
        "admin_jurusan",
        "admin_keuangan",
      ],
      status_type: ["aktif", "nonaktif"],
      validation_status: [
        "pending",
        "validated_keuangan",
        "validated_kepegawaian",
        "validated_jurusan",
        "completed",
      ],
    },
  },
} as const
