Flowchart utilizando mermaid para representar toda UX do sistema

flowchart TD
 subgraph subGraph0["Módulo Clientes"]
        E["Lista de Clientes (Respeitando permissões)"]
        D["Dashboard"]
        F["Novo Cliente"]
        G["Detalhes do Cliente"]
        H["Registrar Interação"]
        I["Agendar Tarefa"]
        J["Editar Dados"]
        K["Transferir Agente"]
        L["Justificar Transferência"]
 end
 subgraph subGraph1["Módulo Funis"]
        M["Funis de Venda"]
        N["Novo Funil"]
        O["Editar Funil"]
        P["Gerenciar Etapas"]
 end
 subgraph subGraph2["Módulo Catálogo"]
        Q["Itens Base"]
        R["Novo Item"]
        S["Editar Campos"]
 end
 subgraph subGraph3["Módulo Operadoras"]
        T["Operadoras"]
        U["Nova Operadora"]
        V["Editar Operadora"]
        W["Associar Itens"]
        X["Definir Comissões"]
 end
 subgraph subGraph4["Módulo Propostas"]
        Y["Propostas"]
        Z["Nova Proposta"]
        AA["Selecionar Operadora"]
        AB["Adicionar Itens"]
        AC["Finalizar Proposta"]
        AD["Exportar PDF/WhatsApp"]
        AE["Confirmar Pagamento"]
 end
 subgraph subGraph5["Módulo Reservas"]
        AF["Reservas"]
        AG["Gerar Reserva"]
        AH["Detalhes da Reserva"]
        AI["Anexar Documentos"]
        AJ["Alterar Status"]
 end
 subgraph subGraph6["Módulo Financeiro"]
        AK{"Controle Financeiro"}
        AL["Financeiro Global"]
        AM["Minhas Comissões"]
        AN["Contas a Receber/Pagar"]
        AO["Relatórios"]
        AP["Lançamentos Manuais"]
        AZ["Relatório Individual"]:::module,agent
        BA["Ganhos Potenciais"]:::module,agent
 end
 subgraph subGraph7["Módulo Logs"]
        AQ["Logs"]
        AR["Logs Completos"]
        AS["Meus Logs"]
 end
 subgraph subGraph8["Módulo Configurações"]
        AT["Configurações"]
        AU["Notificações"]
        AV["Tema Claro/Escuro"]
        AW["Perfil"]
 end
    A["Login"] --> B{"Perfil do Usuário"}
    B -- Master/Admin --> C["Gestão de Usuários"]
    B -- Todos --> D
    D --> E & M & Q & T & Y & AF & AK & AQ & AT & Y
    E --> F & G
    G --> H & I & J & Y
    G -- Master/Admin --> K
    K --> L
    M -- Master/Admin --> N & O
    O --> P
    Q -- Master/Admin --> R & S
    T -- Master/Admin --> U & V
    V --> W
    W --> X
    Y --> Z
    Z --> AA
    AA --> AB
    AB --> AC
    AC --> AD & AE
    AE --> AG
    AF --> AH
    AH --> AI & AJ
    AK -- Master/Admin --> AL
    AK -- Agente --> AM & AZ & BA
    AL --> AN & AO & AP
    AQ -- Master/Admin --> AR
    AQ -- Agente --> AS
    AT --> AU & AV & AW
    C -- Master --> AX["Criar/Editar Admin/Agente"]
    C -- Admin --> AY["Criar/Editar Agente"]
    R --> S
   
    %% Novas conexões para o relatório individual
    AM --> AZ
    AZ --> BA
    BA --> Y & AF
   
    classDef module fill:#e6f3ff,stroke:#0066cc,stroke-width:2px
    classDef admin fill:#ffebee,stroke:#c62828
    classDef agent fill:#e8f5e9,stroke:#2e7d32
    classDef shared fill:#fffde7,stroke:#f9a825


